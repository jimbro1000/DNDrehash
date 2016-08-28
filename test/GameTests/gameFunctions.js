/**
 * Created by Julian on 27/08/2016.
 */
describe("Game Functions", function() {
	describe("Calculate Player Protection", function() {
		beforeEach(function() {
			attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
			inventory = [];
			inventoryCounter = 0;
		});

		it("returns dexterity + 6 if no armour carried", function() {
			expect(calculatePlayerProtection() === (6 + attributes[2])).toBe(true);
		});

		it("returns dexterity + 8 if leather armour carried", function() {
			inventory[1] = 8; inventoryCounter = 1;
			expect(calculatePlayerProtection() === (8 + attributes[2])).toBe(true);
		});

		it("returns dexterity + 16 if chain armour carried", function() {
			inventory[1] = 9; inventoryCounter = 1;
			expect(calculatePlayerProtection() === (16 + attributes[2])).toBe(true);
		});

		it("returns dexterity + 20 if plate armour carried", function() {
			inventory[1] = 10; inventoryCounter = 1;
			expect(calculatePlayerProtection() === (20 + attributes[2])).toBe(true);
		});
	});

	describe("Monster Swings", function() {
		var callCounter;
		var results = [];

		function notRnd() {
			if (callCounter < results.length) return results[callCounter++]; else return 1;
		}

		beforeEach(function() {
			callCounter = 0;
			attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
			inventory = [];
			inventoryCounter = 0;
			currentMonster = 0;
			loadMonsters();

			terminal = function() {
				var lastInput = "";
			};
			terminal.println = function(value) { this.lastInput = value; };
			gameStateMachine = function() {
				var stateMode = 0;
			};
		});

		it("Uses rnd to generate random numbers", function() {
			spyOn(window, 'rnd');
			currentMonster = 1;
			monsterSwings();
			expect(window.rnd).toHaveBeenCalled();
		});

		it("Reduces HP after a hit", function() {
			currentMonster = 1;
			results = [17,1];
			spyOn(window, 'rnd').and.callFake(notRnd);
			monsterSwings();
		});

		describe('Calculates chance to hit against protection', function() {
			beforeEach(function() {
				currentMonster = 1;
				spyOn(window, 'rnd').and.callFake(notRnd);
			});

			it("calculates a hit against no armour", function() {
				results = [17,1];
				monsterSwings();
				expect(gameStateMachine.stateMode === 200).toBe(true);
				expect(terminal.lastInput === ("H.P.=" + attributes[0])).toBe(true);
			});

			it("calculates a minor miss against no armour", function() {
				results = [15,2];
				monsterSwings();
				expect(gameStateMachine.stateMode === 200).toBe(true);
				expect(terminal.lastInput === "HE HIT BUT NOT GOOD ENOUGH").toBe(true);
			});

			it("calculates a critical miss against no armour", function() {
				results = [15,0];
				monsterSwings();
				expect(gameStateMachine.stateMode === 25).toBe(true);
				expect(terminal.lastInput === "HE MISSED").toBe(true);
			});

			it("calculates a hit against leather armour", function() {
				inventory = [0,8];
				inventoryCounter = 1;
				results = [19,1];
				monsterSwings();
				expect(gameStateMachine.stateMode === 200).toBe(true);
				expect(terminal.lastInput === ("H.P.=" + attributes[0])).toBe(true);
			});

			it("calculates a minor miss against leather armour", function() {
				inventory = [0,8];
				inventoryCounter = 1;
				results = [15,2];
				monsterSwings();
				expect(gameStateMachine.stateMode === 200).toBe(true);
				expect(terminal.lastInput === "HE HIT BUT NOT GOOD ENOUGH").toBe(true);
			});

			it("calculates a critical miss against leather armour", function() {
				inventory = [0,8];
				inventoryCounter = 1;
				results = [15,0];
				monsterSwings();
				expect(gameStateMachine.stateMode === 25).toBe(true);
				expect(terminal.lastInput === "HE MISSED").toBe(true);
			});

			it("calculates a hit against chain armour", function() {
				inventory = [0,9];
				inventoryCounter = 1;
				results = [27,1];
				monsterSwings();
				expect(gameStateMachine.stateMode === 200).toBe(true);
				expect(terminal.lastInput === ("H.P.=" + attributes[0])).toBe(true);
			});

			it("calculates a minor miss against chain armour", function() {
				inventory = [0,9];
				inventoryCounter = 1;
				results = [25,2];
				monsterSwings();
				expect(gameStateMachine.stateMode === 200).toBe(true);
				expect(terminal.lastInput === "HE HIT BUT NOT GOOD ENOUGH").toBe(true);
			});

			it("calculates a critical miss against chain armour", function() {
				inventory = [0,9];
				inventoryCounter = 1;
				results = [15,0];
				monsterSwings();
				expect(gameStateMachine.stateMode === 25).toBe(true);
				expect(terminal.lastInput === "HE MISSED").toBe(true);
			});

			it("calculates a hit against plate armour", function() {
				inventory = [0,10];
				inventoryCounter = 1;
				results = [31,1];
				monsterSwings();
				expect(gameStateMachine.stateMode === 200).toBe(true);
				expect(terminal.lastInput === ("H.P.=" + attributes[0])).toBe(true);
			});

			it("calculates a minor miss against plate armour", function() {
				inventory = [0,10];
				inventoryCounter = 1;
				results = [30,2];
				monsterSwings();
				expect(gameStateMachine.stateMode === 200).toBe(true);
				expect(terminal.lastInput === "HE HIT BUT NOT GOOD ENOUGH").toBe(true);
			});

			it("calculates a critical miss against plate armour", function() {
				inventory = [0,10];
				inventoryCounter = 1;
				results = [30,0];
				monsterSwings();
				expect(gameStateMachine.stateMode === 25).toBe(true);
				expect(terminal.lastInput === "HE MISSED").toBe(true);
			});
		});
	});

	describe("Monster action live or die", function() {
		beforeEach(function() {
			attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
			currentMonster = 1;
			loadMonsters();
			gameStateMachine = function() {
				var stateMode = 0;
			};
		});

		it("detects dead monsters and routes to the killed routine", function() {
			monsterStats[currentMonster][3] = 0;
			monsterAction();
			expect(gameStateMachine.stateMode === 203).toBe(true);
		});

		it("routes active monsters to action logic", function() {
			spyOn(window, "monsterMovement").and.callFake(function() { });
			monsterAction();
			expect(window.monsterMovement).toHaveBeenCalled();
		});
	});
});