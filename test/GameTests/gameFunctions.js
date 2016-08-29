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
            expect(attributes[constants.playerHp]).not.toBe(10);
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
			gameStateMachine = {
				stateMode : 0
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

	describe("Monster position translation", function() {
		beforeEach(function() {
            F1=1; F2=1;
            dungeonMap[0] = [0,0,0];
            dungeonMap[1] = [0,5,0];
            dungeonMap[2] = [0,0,0];
		});

        it("moves monster from A to B", function() {
            translateMonsterPosition(1,0);
            expect(dungeonMap[1][1]).toBe(0);
            expect(dungeonMap[2][1]).toBe(5);
        });
	});

    describe("Resolve monster movement", function() {
        describe("Finds best direction of movement", function() {
            beforeEach(function() {
                F1=1; F2=1;
                dungeonMap[0] = [0,0,0];
                dungeonMap[1] = [0,5,0];
                dungeonMap[2] = [0,0,0];
                spyOn(window,"translateMonsterPosition").and.callThrough();
            });

            it("moves across row if vertical offset is larger", function() {
                rangeRowOffset = 2;
                rangeColumnOffset = 1;
                resolveMonsterMove();
                expect(translateMonsterPosition).toHaveBeenCalled();
                expect(F1).toBe(0);
                expect(F2).toBe(1);
            });

            it("moves along row if horizontal offset is larger", function() {
                rangeRowOffset = 1;
                rangeColumnOffset = 2;
                resolveMonsterMove();
                expect(translateMonsterPosition).toHaveBeenCalled();
                expect(F1).toBe(1);
                expect(F2).toBe(0);
            });

            it("moves towards the target if above", function() {
                rangeRowOffset = 2;
                rangeColumnOffset = 1;
                resolveMonsterMove();
                expect(F1).toBe(0);
                expect(F2).toBe(1);
            });

            it("moves towards the target if below", function() {
                rangeRowOffset = -2;
                rangeColumnOffset = 1;
                resolveMonsterMove();
                expect(F1).toBe(2);
                expect(F2).toBe(1);
            });

            it("moves towards the target if to left", function() {
                rangeRowOffset = 1;
                rangeColumnOffset = 2;
                resolveMonsterMove();
                expect(F1).toBe(1);
                expect(F2).toBe(0);
            });

            it("moves towards the target if to right", function() {
                rangeRowOffset = 1;
                rangeColumnOffset = -2;
                resolveMonsterMove();
                expect(F1).toBe(1);
                expect(F2).toBe(2);
            });
        });

        describe("Moves according to the target map cell", function() {
            beforeEach(function() {
                F1=1; F2=1;
                dungeonMap[0] = [0,1,0,0];
                dungeonMap[1] = [0,5,2,0];
                loadMonsters();
                currentMonster = 1;
                spyOn(window,"inBounds").and.callFake(function() { return true; });
                spyOn(window,"findRange").and.callFake(function() { });
            });

            it("kills the monster if it finds a trap", function() {
                rangeRowOffset = 1;
                rangeColumnOffset = -2;
                resolveMonsterMove();
                expect(monsterStats[currentMonster][6]).toBe(0);
            });

            it("moves through a secret door if is clear on the opposite side", function() {
                rangeRowOffset = 1;
                rangeColumnOffset = -2;
                dungeonMap[1][2] = 3;
                resolveMonsterMove();
                expect(dungeonMap[1][1]).toBe(0);
                expect(dungeonMap[1][3]).toBe(5);
            });

            it("doesn't move through a secret door if is not clear on the opposite side", function() {
                rangeRowOffset = 1;
                rangeColumnOffset = -2;
                dungeonMap[1][2] = 3;
                dungeonMap[1][3] = 1;
                resolveMonsterMove();
                expect(dungeonMap[1][1]).toBe(5);
                expect(dungeonMap[1][3]).toBe(1);
            });

            it("moves through a door if is clear on the opposite side", function() {
                rangeRowOffset = 1;
                rangeColumnOffset = -2;
                dungeonMap[1][2] = 4;
                resolveMonsterMove();
                expect(dungeonMap[1][1]).toBe(0);
                expect(dungeonMap[1][3]).toBe(5);
            });

            it("doesn't move through a door if is not clear on the opposite side", function() {
                rangeRowOffset = 1;
                rangeColumnOffset = -2;
                dungeonMap[1][2] = 4;
                dungeonMap[1][3] = 1;
                resolveMonsterMove();
                expect(dungeonMap[1][1]).toBe(5);
                expect(dungeonMap[1][3]).toBe(1);
            });

            it("doesn't move into a wall", function() {
                rangeRowOffset = 2;
                rangeColumnOffset = 1;
                resolveMonsterMove();
                expect(dungeonMap[1][1]).toBe(5);
                expect(dungeonMap[0][1]).toBe(1);
            });

            it("moves into open space", function() {
                rangeRowOffset = 1;
                rangeColumnOffset = 2;
                resolveMonsterMove();
                expect(dungeonMap[1][1]).toBe(0);
                expect(dungeonMap[1][0]).toBe(5);
            });

            it("moves into treasure", function() {
                rangeRowOffset = 1;
                rangeColumnOffset = 2;
                dungeonMap[1][0] = 6;
                resolveMonsterMove();
                expect(dungeonMap[1][1]).toBe(0);
                expect(dungeonMap[1][0]).toBe(5);
            });

            it("moves into a strength boost", function() {
                rangeRowOffset = 1;
                rangeColumnOffset = 2;
                dungeonMap[1][0] = 7;
                resolveMonsterMove();
                expect(dungeonMap[1][1]).toBe(0);
                expect(dungeonMap[1][0]).toBe(5);
            });

            it("moves into a constitution boost", function() {
                rangeRowOffset = 1;
                rangeColumnOffset = 2;
                dungeonMap[1][0] = 8;
                resolveMonsterMove();
                expect(dungeonMap[1][1]).toBe(0);
                expect(dungeonMap[1][0]).toBe(5);
            });
        });

        describe("Routes control according to range", function() {
            beforeEach(function() {
                gameStateMachine = { stateMode : 0 };
            });

            it("calculates the range from player to monster", function() {
                spyOn(window,"findRange").and.callFake(function() { range = 0; });
                monsterMovement();
                expect(findRange).toHaveBeenCalled();
            });

            it("routes to attack if range < 2", function() {
                spyOn(window,"findRange").and.callFake(function() { range = 0; });
                monsterMovement();
                expect(gameStateMachine.stateMode).toBe(207);
            });

            it("routes back to main loop if range >= 2 and P0 > 10", function() {
                spyOn(window,"findRange").and.callFake(function() { range = 2; });
                P0 = 11;
                monsterMovement();
                expect(gameStateMachine.stateMode).toBe(25);
            });

            it("routes back to movement if range >= 2 and P0 <= 10", function() {
                spyOn(window,"findRange").and.callFake(function() { range = 2; });
                spyOn(window,"resolveMonsterMove").and.callFake(function() {});
                P0 = 9;
                monsterMovement();
                expect(resolveMonsterMove).toHaveBeenCalled();
            });
        });
    });
});