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

			terminal = {
				lastInput : ""
			};
			terminal.println = function(value) { this.lastInput = value; };
			gameStateMachine = {
				stateMode : 0
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

	describe("Reset after clear", function() {
		beforeEach(function() {
			loadMonsters();
			for (var i=1; i<11; i++) {
				monsterStats[i][3] = 0;
				monsterStats[i][constants.monsterHp] = 0;
			}
			attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
			difficultyFactor = 1;
			gameStateMachine = {
				stateMode: 0
			};
			terminal = {};
			terminal.println = function() {};
		});

		it("checks player input for a 'YES'", function() {
			inputString = "YES";
			resetAfterClear();
			expect(gameStateMachine.stateMode).toBe(25);
			expect(attributes[constants.playerHp]).toBe(15);
			expect(difficultyFactor).toBe(2);
			for(var i=1; i<11; i++) {
				expect(monsterStats[i][3]).toBe(monsterStats[i][4] * difficultyFactor);
				expect(monsterStats[i][constants.monsterHp]).toBe(monsterStats[i][constants.monsterStartHp] * difficultyFactor);
			}
		});

		it("stops the game if input is not a 'YES'", function() {
			inputString = "";
			spyOn(terminal,"println").and.callThrough();
			resetAfterClear();
			expect(gameStateMachine.stateMode).toBe(30);
			expect(attributes[constants.playerHp]).toBe(10);
			expect(difficultyFactor).toBe(1);
			for(var i=1; i<11; i++) {
				expect(monsterStats[i][3]).toBe(0);
				expect(monsterStats[i][constants.monsterHp]).toBe(0);
			}
			expect(terminal.println).toHaveBeenCalled();
		});
	});

	describe("Make a monster", function() {
	    var randomResults = [];
        var randomFakeCounter;
		beforeEach(function() {
			loadMonsters();
			defaultMap();
            currentMonster = 0;
            M = 1;
            mapX = 5;
            mapY = 4;
            F1 = -1;
            F2 = -1;
            spyOn(window,"rnd").and.callFake(function(){ return randomResults[randomFakeCounter++]; });
            spyOn(window,"spawnMonsterAt").and.callThrough();
            spyOn(window,"inBounds").and.callThrough();
            gameStateMachine = { stateMode : 0 };
            randomFakeCounter = 0;
		});

		it("populates currentMonster from M", function() {
		    randomResults = [0, 0.1];
            makeAMonster();
            expect(currentMonster).toBe(1);
		});

		it("changes state mode to 200", function() {
            randomResults = [0, 0.1];
            makeAMonster();
            expect(gameStateMachine.stateMode).toBe(200);
		});

		it("uses helper function rnd to generate random numbers", function() {
            randomResults = [0, 0.1];
            makeAMonster();
            expect(rnd).toHaveBeenCalled();
		});

        it("uses spawnMonsterAt to safely generate the monster position", function() {
            randomResults = [0, 0.1];
            makeAMonster();
            expect(spawnMonsterAt).toHaveBeenCalled();
        });

		it("uses inbounds function to check validity of coordinates", function() {
            randomResults = [0, 0.1];
            makeAMonster();
            expect(inBounds).toHaveBeenCalled();
		});

        it("populates the F1 and F2 global variables after the spawn completes", function() {
            randomResults = [0, 0.1];
            makeAMonster();
            expect(F1).toBe(1);
            expect(F2).toBe(2);
        });

        it("safely completes if map data prevents successful spawn", function() {
            // generate random results correct for test - needs 11 failed attempts at scanning to trip fail safe
			randomResults = [
				0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
				0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
				0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
				0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
				0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
				0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
				0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
				0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
				0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
				0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
				0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
				0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8
			];
			var attempts = makeAMonster();
            expect(F1).toBe(-1);
            expect(F2).toBe(-1);
			expect(attempts).toBe(11);
        });
	});

    describe("Spawn monster at", function() {
        beforeEach(function() {
            defaultMap();
            F1 = -1;
            F2 = -1;
        });

        it("sets the given map coordinates to 5", function() {
            spawnMonsterAt(1, 1);
            expect(dungeonMap[1][1]).toBe(5);
        });

        it("populates the global map coordinate variables for monster actions", function() {
            spawnMonsterAt(2, 1);
            expect(F1).toBe(2);
            expect(F2).toBe(1);
        });
    });

    describe("Confirmed kill", function() {
        beforeEach(function() {
            loadMonsters();
            F1 = -1;
            F2 = -1;
            attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
            gameStateMachine = {
                stateMode: 0
            };
            terminal = {};
            terminal.println = function() {};
            currentMonster = 1;
            K1 = -1;
            spyOn(terminal,"println").and.callThrough();
        });

        it("reports the kill to the terminal", function() {
            confirmedKill();
            expect(terminal.println).toHaveBeenCalledTimes(3);
        });

        it("gives the player a gold reward", function() {
            var initialGold = attributes[constants.playerGold];
            var reward = monsterStats[currentMonster][constants.monsterStartHp];
            confirmedKill();
            expect(attributes[constants.playerGold]).toBe(initialGold + reward);
        });

        it("clears the monster temporary data", function() {
            confirmedKill();
            expect(currentMonster).toBe(0);
            expect(K1).toBe(0);
            expect(F1).toBe(0);
            expect(F2).toBe(0);
        });

        it("resets the monster health and strength for a respawn if J6 = 1", function() {
            var targetMonster = currentMonster;
            J6 = 1;
            confirmedKill();
            expect(monsterStats[targetMonster][3]).toBe(monsterStats[targetMonster][4] * monsterStats[targetMonster][1]);
            expect(monsterStats[targetMonster][constants.monsterHp]).not.toBe(0);
        });

        it("sets monster health to 0 if J6 != 1", function() {
            var targetMonster = currentMonster;
            J6 = 0;
            confirmedKill();
            expect(monsterStats[targetMonster][constants.monsterHp]).toBe(0);
        });

        it("routes game state to 25", function() {
            confirmedKill();
            expect(gameStateMachine.stateMode).toBe(25);
        });
    });

    describe("Monster move", function() {
        var randomResults = [];
        var randomFakeCounter;

        beforeEach(function() {
            loadMonsters();
            gameStateMachine = {
                stateMode: 0
            };
            terminal = {};
            terminal.println = function() {};
            terminal.print = function() {};
            spyOn(terminal,"println").and.callThrough();
            spyOn(terminal,"print").and.callThrough();
            spyOn(window, "rnd").and.callFake(function() { return randomResults[randomFakeCounter++]; });
            spyOn(window, "inputStr").and.callFake(function() {});
            randomFakeCounter = 0;
        });

        it("routes game state to 205 if no monsters left to move (all dead)", function() {
            for(var i=1; i<11; i++) monsterStats[i][constants.monsterHp] = 0;
            monsterMove();
            expect(gameStateMachine.stateMode).toBe(205);
        });

        it("routes game state to 204 once a 'move' is identified", function() {
            randomResults = [0.95];
            monsterMove();
            expect(gameStateMachine.stateMode).toBe(204);
        });

        it("routes game state to 200 if no moves are identified", function() {
            for (var i=0;i<500;i++) randomResults[i] = 0;
            monsterMove();
            expect(gameStateMachine.stateMode).toBe(200);
        });

        it("asks the user if a reset is desired if all monsters are dead", function() {
            for(var i=1; i<11; i++) monsterStats[i][constants.monsterHp] = 0;
            monsterMove();
            expect(terminal.println).toHaveBeenCalled();
            expect(terminal.print).toHaveBeenCalled();
            expect(inputStr).toHaveBeenCalled();
        });

        it("uses rnd to generate random numbers for determining move", function() {
            randomResults = [9.5];
            monsterMove();
            expect(rnd).toHaveBeenCalled();
        });

        it("stores the monster id moved in M", function() {
            randomResults = [0, 9.5];
            monsterMove();
            expect(M).toBe(2);
        });
    });

    describe("Got more equipment",function() {
        var randomResults = [];
        var randomFakeCounter;

        beforeEach(function() {
            gameStateMachine = {
                stateMode: 0
            };
            terminal = {};
            terminal.println = function() {};
            spyOn(terminal,"println").and.callThrough();
            spyOn(window, "rnd").and.callFake(function() { return randomResults[randomFakeCounter++]; });
            randomFakeCounter = 0;
            attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
        });

        it("checks user input for a 'YES' and routes to state 25 (shop) if true", function() {
            inputString = "YES";
            gotMoreEquipment();
            expect(gameStateMachine.stateMode).toBe(18);
        });

        it("gifts the player 2 hp if a 'YES' and informs the player", function() {
            inputString = "YES";
            gotMoreEquipment();
            expect(terminal.println).toHaveBeenCalled();
            expect(attributes[constants.playerHp]).toBe(12);
        });

        it("runs a 50% chance to move a monster if user input is not a 'YES'", function() {
            inputString = "NO";
            randomResults = [20];
            gotMoreEquipment();
            expect(gameStateMachine.stateMode).toBe(202);
        });

        it("routes to the main loop if all other tests are false", function() {
            inputString = "NO";
            randomResults = [0];
            gotMoreEquipment();
            expect(gameStateMachine.stateMode).toBe(25);
        });
    });

    describe("check for clone move", function() {
        var randomResults = [];
        var randomFakeCounter;

        beforeEach(function() {
            gameStateMachine = {
                stateMode: 0
            };
            spyOn(window, "rnd").and.callFake(function () {
                return randomResults[randomFakeCounter++];
            });
            randomFakeCounter = 0;
        });

        it("uses rnd to generate random numbers for determining move", function() {
            randomResults = [20];
            testForCloneMove();
            expect(rnd).toHaveBeenCalled();
        });

        it("sets state to 25 (main loop) on 50%", function() {
            randomResults = [10];
            testForCloneMove();
            expect(gameStateMachine.stateMode).toBe(25);
        });

        it("sets state to 202 (clone move) on other 50%", function() {
            randomResults = [11];
            testForCloneMove();
            expect(gameStateMachine.stateMode).toBe(202);
        });
    });

    describe("Check Player Health", function() {
        beforeEach(function() {
            attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
            terminal = {
                lastInput : ""
            };
            terminal.println = function(value) { this.lastInput = value; };
            gameStateMachine = {
                stateMode : 1
            };
            spyOn(terminal,"println").and.callThrough();
        });

        it("checks HP to see if it is 2 or over and does nothing if true", function() {
            attributes[constants.playerHp] = 2;
            checkPlayerHealth();
            expect(attributes[constants.playerHp]).toBe(2);
            expect(attributes[constants.playerCon]).toBe(10);
            expect(terminal.println).not.toHaveBeenCalled();
        });

        it("checks if HP is 1 and warns player if true", function() {
            attributes[constants.playerHp] = 1;
            checkPlayerHealth();
            expect(attributes[constants.playerHp]).toBe(1);
            expect(attributes[constants.playerCon]).toBe(10);
            expect(terminal.println).toHaveBeenCalled();
            expect(terminal.lastInput).toBe("WATCH IT H.P.=1");
        });

        it("checks if HP is 0 and kills player if Con is less than 9", function() {
            attributes[constants.playerHp] = 0;
            attributes[constants.playerCon] = 8;
            checkPlayerHealth();
            expect(attributes[constants.playerHp]).toBe(0);
            expect(attributes[constants.playerCon]).toBe(8);
            expect(terminal.println).toHaveBeenCalled();
            expect(terminal.lastInput).toBe("SORRY YOUR DEAD");
            expect(gameStateMachine.stateMode).toBe(30);
        });

        it("checks if HP is 0 and warns player if Con is 9 or more", function() {
            attributes[constants.playerHp] = 0;
            attributes[constants.playerCon] = 9;
            checkPlayerHealth();
            expect(attributes[constants.playerHp]).toBe(0);
            expect(attributes[constants.playerCon]).toBe(9);
            expect(terminal.println).toHaveBeenCalled();
            expect(terminal.lastInput).toBe("H.P.=0 BUT CONST. HOLDS");
        });

        it("checks if HP is less than 0 and transfers Con to HP (2:1) until HP is 0 and Con is 9 or more then warns player", function() {
            attributes[constants.playerHp] = -2;
            attributes[constants.playerCon] = 13;
            checkPlayerHealth();
            expect(attributes[constants.playerHp]).toBe(0);
            expect(attributes[constants.playerCon]).toBe(9);
            expect(terminal.println).toHaveBeenCalled();
            expect(terminal.lastInput).toBe("H.P.=0 BUT CONST. HOLDS");
        });

        it("checks if HP is less than 0 and transfers Con to HP (2:1) until HP is less than 0 and Con is less than 9 then kills player", function() {
            attributes[constants.playerHp] = -3;
            attributes[constants.playerCon] = 12;
            checkPlayerHealth();
            expect(attributes[constants.playerHp]).toBe(0);
            expect(attributes[constants.playerCon]).toBe(0);
            expect(terminal.println).toHaveBeenCalled();
            expect(terminal.lastInput).toBe("SORRY YOUR DEAD");
            expect(gameStateMachine.stateMode).toBe(30);
        });
    });

    describe("Route Game Move", function() {
        beforeEach(function() {
            K1 = 0;
            attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
            terminal = {
                lastInput : ""
            };
            terminal.println = function(value) { this.lastInput = value; };
            gameStateMachine = {
                stateMode : 1,
                waitTransition : false
            };
            spyOn(terminal,"println").and.callThrough();
            spyOn(window,"checkPlayerHealth").and.callThrough();
            spyOn(window,"testForCloneMove").and.callFake(function() { gameStateMachine.stateMode = 25; });
        });

        it("checks for a kill", function() {
            K1 = -1;
            routeGameMove();
            expect(gameStateMachine.stateMode).toBe(203);
        });

        it("checks if not a kill then check player is dead", function() {
            attributes[constants.playerHp] = -1;
            attributes[constants.playerCon] = 8;
            routeGameMove();
            expect(gameStateMachine.stateMode).toBe(30);
            expect(checkPlayerHealth).toHaveBeenCalled();
        });

        it("checks if a monster is waiting to move", function() {
            currentMonster = 1;
            routeGameMove();
            expect(gameStateMachine.stateMode).toBe(206);
        });

        it("checks if player is at the starting position and offers to shop if gold >= 100", function() {
            currentMonster = 0;
            mapY = 1;
            mapX = 12;
            spyOn(window,"inputStr").and.callFake(function() { gameStateMachine.waitTransition = true; });
            routeGameMove();
            expect(gameStateMachine.stateMode).toBe(201);
            expect(attributes[constants.playerGold]).toBe(900);
            expect(gameStateMachine.waitTransition).toBe(true);
            expect(terminal.lastInput).toBe("WANT TO BUY MORE EQUIPMENT");
        });

        it("checks if player is at the starting position and welcomes if gold < 100 and hands off to main routine", function() {
            currentMonster = 0;
            mapY = 1;
            mapX = 12;
            attributes[constants.playerGold] = 99;
            routeGameMove();
            expect(testForCloneMove).toHaveBeenCalled();
            expect(attributes[constants.playerGold]).toBe(99);
            expect(terminal.lastInput).toBe("SO YOU HAVE RETURNED");
            expect(gameStateMachine.stateMode).not.toBe(0);
        });

        it("checks the player is not at the starting position and hands off to main routine", function() {
            currentMonster = 0;
            mapY = 2;
            mapX = 12;
            routeGameMove();
            expect(testForCloneMove).toHaveBeenCalled();
            expect(gameStateMachine.stateMode).not.toBe(0);
        });
    });

    describe("Modify Map Process", function() {
        describe("Modify Map Save", function() {
            beforeEach(function() {
                defaultMap();
                gameStateMachine = {
                    stateMode : 1
                };
                cookieLifespan = 2000;
                spyOn(window,"setCookie").and.callFake(function() {});
            });

            it("checks player input to confirm save (1) and writes to cookie", function() {
                inputString = "1";
                Dn = 1;
                modifyMapSave();
                expect(setCookie).toHaveBeenCalledTimes(26);
                expect(setCookie).toHaveBeenCalledWith("dnd1file1.dungeonMap.0","1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|",2000);
                expect(gameStateMachine.stateMode).toBe(200);
            });

            it("checks player input to confirm save (0)", function() {
                inputString="0";
                Dn = 1;
                modifyMapSave();
                expect(setCookie).not.toHaveBeenCalled();
                expect(gameStateMachine.stateMode).toBe(200);
            });
        });

        describe("Modify Map Done", function() {
            beforeEach(function() {
                terminal = {
                    lastInput : ""
                };
                terminal.println = function(value) { this.lastInput = value; };
                gameStateMachine = {
                    stateMode : 1,
                    waitTransition : false
                };
                defaultMap();
                spyOn(window,"setCookie").and.callFake(function() {});
                spyOn(terminal,"println").and.callThrough();
                spyOn(window,"input").and.callFake(function() { gameStateMachine.waitTransition = true; });
            });

            it("accepts player input x,y,content and modifies map", function() {
                inputStrings[2] = "1";
                inputStrings[1] = "2";
                inputStrings[0] = "5";
                modifyMapDone();
                expect(dungeonMap[2][1]).toBe(5);
                expect(input).not.toHaveBeenCalled();
                expect(terminal.println).not.toHaveBeenCalled();
                expect(gameStateMachine.stateMode).toBe(103);
            });

            it("treats a negative content value as an instruction to stop", function() {
                inputStrings[2] = "1";
                inputStrings[1] = "2";
                inputStrings[0] = "-5";
                modifyMapDone();
                expect(input).toHaveBeenCalled();
                expect(dungeonMap[2][1]).toBe(0);
                expect(terminal.println).toHaveBeenCalled();
                expect(terminal.lastInput).toBe("SAVE");
                expect(gameStateMachine.stateMode).toBe(105);
            });
        });

        describe("Modify Got Map", function() {
            beforeEach(function() {
                gameStateMachine = {
                    stateMode : 1
                };
            });

            it("converts user input into dungeon number", function() {
                Dn = 0;
                inputString = "1";
                modifyGotMap();
                expect(Dn).toBe(1);
                expect(gameStateMachine.stateMode).toBe(103);
            });
        });

        describe("Modify Map", function() {
            beforeEach(function() {
                terminal = {
                    lastInput : ""
                };
                terminal.print = function(value) { this.lastInput = value; };
                gameStateMachine = {
                    stateMode : 1,
                    waitTransition : false
                };
                spyOn(terminal,"print").and.callThrough();
                spyOn(window,"input").and.callFake(function() { gameStateMachine.waitTransition = true; })
            });

            it("prompts the user for a dungeon number", function() {
                modifyMap();
                expect(terminal.print).toHaveBeenCalledWith("DNG");
                expect(input).toHaveBeenCalled();
                expect(gameStateMachine.stateMode).toBe(102.5);
            });
        });
    });

    describe("Buy Health", function() {
        beforeEach(function() {
            attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
            terminal = {
                lastInput : ""
            };
            terminal.println = function(value) { this.lastInput = value; };
            terminal.print = function(value) { this.lastInput = value; };
            gameStateMachine = {
                stateMode : 1,
                waitTransition : false
            };
            spyOn(terminal,"println").and.callThrough();
            spyOn(terminal,"print").and.callThrough();
            spyOn(window,"input").and.callFake(function() {});
        });

        describe("Add HP", function() {
            it("accepts player input and converts gold to health if enough gold is carried and reports result", function() {
                inputString = "4";
                addHP();
                expect(attributes[constants.playerGold]).toBe(200);
                expect(attributes[constants.playerHp]).toBe(14);
                expect(gameStateMachine.stateMode).toBe(200);
                expect(terminal.println).toHaveBeenCalledTimes(9);
            });

            it("rejects player input if insufficient gold carried", function() {
                inputString = "6";
                addHP();
                expect(attributes[constants.playerGold]).toBe(1000);
                expect(attributes[constants.playerHp]).toBe(10);
                expect(gameStateMachine.stateMode).toBe(100);
                expect(terminal.println).toHaveBeenCalledTimes(1);
            });
        });

        describe("Buy HP", function() {
            it("prompts the user for quantity of hp to buy", function() {
                buyHP();
                expect(input).toHaveBeenCalled();
                expect(terminal.print).toHaveBeenCalledWith("HOW MANY 200 GP. EACH ");
                expect(gameStateMachine.stateMode).toBe(101);
            });
        });
    });

    describe("Show Cheat Map", function() {
        beforeEach(function() {
            terminal = {
                lastInput : ""
            };
            terminal.println = function(value) { this.lastInput = value; };
            gameStateMachine = {
                stateMode : 1,
                waitTransition : false
            };
            defaultMap();
            spyOn(terminal,"println").and.callThrough();
        });

        it("displays the entire map to the player", function() {
            showCheatMap();
            expect(terminal.println).toHaveBeenCalledTimes(26);
            expect(gameStateMachine.stateMode).toBe(25);
        });
    });

    describe("Purchase Magic (Cleric & Wizard)", function() {
        beforeEach(function() {
            attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
            attributeNames = [];
            terminal = {
                lastInput : ""
            };
            terminal.println = function(value) { this.lastInput = value; };
            terminal.print = function(value) { this.lastInput = value; };
            gameStateMachine = {
                stateMode : 1,
                waitTransition : false
            };
            clericSpellCounter = 0;
            wizardSpellCounter = 0;
            clericSpellbook = [];
            wizardSpellbook = [];
            clericSpellPrices = [0, 500, 200, 200, 200, 100, 300, 1000, 200];
            wizardSpellPrices = [0, 75, 500, 200, 750, 600, 100, 200, 300, 200, 600];
            spyOn(terminal,"println").and.callThrough();
            spyOn(terminal,"print").and.callThrough();
            spyOn(window,"inputStr").and.callFake(function() {});
            spyOn(window,"input").and.callFake(function() {});
        });

        describe("Buy Magic Prompt", function() {
            it("rejects non-MU", function() {
                attributeNames[constants.playerClass] = "FIGHTER";
                buyMagic();
                expect(terminal.println).toHaveBeenCalledWith("YOU CANT BUY ANY");
                expect(gameStateMachine.stateMode).toBe(25);
            });

            it("accepts cleric class", function() {
                attributeNames[constants.playerClass] = "CLERIC";
                buyMagic();
                expect(terminal.println).not.toHaveBeenCalled();
                expect(gameStateMachine.stateMode).toBe(93);
            });

            it("accepts wizard class", function() {
                attributeNames[constants.playerClass] = "WIZARD";
                buyMagic();
                expect(terminal.println).not.toHaveBeenCalled();
                expect(gameStateMachine.stateMode).toBe(94);
            });
        });

        describe("Ask A Cleric", function() {
            it("prompts the user if the list of spell choices is known", function() {
                askACleric();
                expect(terminal.println).toHaveBeenCalledWith("DO YOU KNOW THE CHOICES");
                expect(inputStr).toHaveBeenCalled();
                expect(gameStateMachine.stateMode).toBe(95);
            });
        });

        describe("Ask A Wizard", function() {
            it("prompts the user if the list of spell choices is known", function() {
                askAWizard();
                expect(terminal.println).toHaveBeenCalledWith("DO YOU KNOW THE SPELLS");
                expect(inputStr).toHaveBeenCalled();
                expect(gameStateMachine.stateMode).toBe(96);
            });
        });

        describe("Cleric Spell Choices", function() {
            it("routes to the input response for cleric spell choices", function() {
                inputString = "";
                clericSpellChoices();
                expect(input).toHaveBeenCalled();
                expect(gameStateMachine.stateMode).toBe(97);
            });

            it("if the user inputs 'NO' the list of spells is shown", function() {
                inputString = "NO";
                clericSpellChoices();
                expect(terminal.println).toHaveBeenCalledTimes(4);
                expect(terminal.print).toHaveBeenCalledTimes(1);
            });

            it("if the user doesn't input 'NO' the list of spells is skipped", function() {
                inputString = "YES";
                clericSpellChoices();
                expect(terminal.println).not.toHaveBeenCalled();
                expect(terminal.print).not.toHaveBeenCalled();
            });
        });

        describe("Wizard Spell Choices", function() {
            it("routes to the input response for wizard spell choices", function() {
                inputString = "";
                wizardSpellChoices();
                expect(input).toHaveBeenCalled();
                expect(gameStateMachine.stateMode).toBe(98);
            });

            it("if the user inputs 'NO' the list of spells is shown", function() {
                inputString = "NO";
                wizardSpellChoices();
                expect(terminal.println).toHaveBeenCalledTimes(5);
                expect(terminal.print).toHaveBeenCalledTimes(1);
            });

            it("if the user doesn't input 'NO' the list of spells is skipped", function() {
                inputString = "YES";
                wizardSpellChoices();
                expect(terminal.println).not.toHaveBeenCalled();
                expect(terminal.print).not.toHaveBeenCalled();
            });
        });

        describe("Purchase Cleric Spell", function() {
            it("checks input for a negative number and lists spellbook and exits purchase if true", function() {
                Q = -1;
                clericSpellbook = [0, "A","B", "C"];
                clericSpellCounter = 3;
                clericSpellPurchase();
                expect(gameStateMachine.stateMode).toBe(25);
                expect(terminal.println).toHaveBeenCalledWith("YOUR SPELLS ARE");
                expect(terminal.println).toHaveBeenCalledTimes(5);
            });

            it("checks input for the upper positive limit and if true skips input and repeats", function() {
                Q = 9;
                clericSpellPurchase();
                expect(gameStateMachine.stateMode).toBe(97);
                expect(input).toHaveBeenCalled();
                expect(terminal.println).not.toHaveBeenCalled();
            });

            it("adds the chosen spell if enough gold is carried", function() {
                Q = 4;
                clericSpellPurchase();
                expect(gameStateMachine.stateMode).toBe(97);
                expect(input).toHaveBeenCalled();
                expect(terminal.println).toHaveBeenCalledWith("IT IS YOURS");
                expect(clericSpellCounter).toBe(1);
                expect(clericSpellbook[1]).toBe(4);
                expect(attributes[constants.playerGold]).toBe(800);
            });

            it("warns player if insufficient gold is carried", function() {
                Q = 4;
                attributes[constants.playerGold] = 0;
                clericSpellPurchase();
                expect(gameStateMachine.stateMode).toBe(97);
                expect(input).toHaveBeenCalled();
                expect(terminal.println).toHaveBeenCalledWith("COSTS TOO MUCH");
                expect(clericSpellCounter).toBe(0);
                expect(attributes[constants.playerGold]).toBe(0);
            });
        });

        describe("Purchase Wizard Spell", function() {
            it("checks input for a negative number and lists spellbook and exits purchase if true", function() {
                Q = -1;
                wizardSpellbook = [0, "A","B", "C"];
                wizardSpellCounter = 3;
                wizardSpellPurchase();
                expect(gameStateMachine.stateMode).toBe(25);
                expect(terminal.println).toHaveBeenCalledWith("YOU NOW HAVE");
                expect(terminal.println).toHaveBeenCalledTimes(4);
            });

            it("checks input for the upper positive limit and if true skips input and repeats", function() {
                Q = 11;
                wizardSpellPurchase();
                expect(gameStateMachine.stateMode).toBe(98);
                expect(input).toHaveBeenCalled();
                expect(terminal.println).not.toHaveBeenCalled();
            });

            it("adds the chosen spell if enough gold is carried", function() {
                Q = 4;
                wizardSpellPurchase();
                expect(gameStateMachine.stateMode).toBe(98);
                expect(input).toHaveBeenCalled();
                expect(terminal.println).toHaveBeenCalledWith("IT IS YOURS");
                expect(wizardSpellCounter).toBe(1);
                expect(wizardSpellbook[1]).toBe(4);
                expect(attributes[constants.playerGold]).toBe(250);
            });

            it("warns player if insufficient gold is carried", function() {
                Q = 4;
                attributes[constants.playerGold] = 0;
                wizardSpellPurchase();
                expect(gameStateMachine.stateMode).toBe(98);
                expect(input).toHaveBeenCalled();
                expect(terminal.println).toHaveBeenCalledWith("COSTS TOO MUCH");
                expect(wizardSpellCounter).toBe(0);
                expect(attributes[constants.playerGold]).toBe(0);
            });
        });
    });

    describe("Casting Spells (Cleric & Wizard)", function() {
        var randomResults = [];
        var randomCounter;

        beforeAll(function() {
            terminal = {
                lastInput : ""
            };
            terminal.println = function(value) { this.lastInput = value; };
            terminal.print = function(value) { this.lastInput = value; };
            defaultMap();
        });

        beforeEach(function() {
            gameStateMachine = {
                stateMode : 1,
                waitTransition : false
            };
            currentWeapon = 0;
            randomCounter = 0;
            spyOn(terminal,"println").and.callThrough();
            spyOn(terminal,"print").and.callThrough();
            spyOn(window,"input").and.callFake(function() {});
            spyOn(window,"inputStr").and.callFake(function() {});
            spyOn(window, "inputX").and.callFake(function() {});
            spyOn(window, "rnd").and.callFake(function() { return randomResults[randomCounter++]; });
            spyOn(window, "inBounds").and.callThrough();
        });

        describe("Validate Casting Action Choice", function() {
            it("checks that a weapon isn't equipped", function() {
                currentWeapon = 1;
                casting();
                expect(gameStateMachine.stateMode).toBe(200);
                expect(terminal.println).toHaveBeenCalledWith("YOU CANT USE MAGIC WITH WEAPON IN HAND");
            });

            it("checks that the player is not a magic user", function() {
                attributeNames[constants.playerClass] = "FIGHTER";
                casting();
                expect(gameStateMachine.stateMode).toBe(200);
                expect(terminal.println).toHaveBeenCalledWith("YOU CANT USE MAGIC YOUR NOT A M.U.");
            });

            it("checks that the player is a wizard", function() {
                attributeNames[constants.playerClass] = "WIZARD";
                casting();
                expect(gameStateMachine.stateMode).toBe(87);
                expect(terminal.print).toHaveBeenCalledWith("SPELL #");
                expect(input).toHaveBeenCalled();
            });

            it("checks that the player is a cleric", function() {
                attributeNames[constants.playerClass] = "CLERIC";
                casting();
                expect(gameStateMachine.stateMode).toBe(78);
                expect(terminal.print).toHaveBeenCalledWith("CLERICAL SPELL #");
                expect(input).toHaveBeenCalled();
            });
        });

        describe("Wizard Spell Casting", function() {
            beforeEach(function() {
                wizardSpellbook = [0,1,2,3,4,5,6,7,8,9,10];
                wizardSpellCounter = 10;
                mapX = 5;
                mapY = 5;
            });

            describe("Route Spell Choice", function() {
                it("accepts user input and checks it is a valid spell choice, warns user if not", function() {
                    wizardSpellbook[5] = 0;
                    inputString = "5";
                    gotWizardSpell();
                    expect(gameStateMachine.stateMode).toBe(25);
                    expect(terminal.println).toHaveBeenCalledWith("YOU DONT HAVE THAT ONE");
                });

                it("accepts PUSH(1) spell and skips input if range is 0", function() {
                    inputString = "1";
                    F1 = mapY;
                    F2 = mapX;
                    gotWizardSpell();
                    expect(gameStateMachine.stateMode).toBe(73);
                    expect(S).toBe(0);
                    expect(T).toBe(0);
                    expect(Z5).toBe(1);
                    expect(inputString).toBe("");
                    expect(terminal.println).not.toHaveBeenCalled();
                });

                it("accepts PUSH(1) spell and prompts user for further input if range > 0", function() {
                    inputString = "1";
                    F1 = 1;
                    F2 = 1;
                    gotWizardSpell();
                    expect(gameStateMachine.stateMode).toBe(73);
                    expect(terminal.println).toHaveBeenCalledWith("ARE YOU ABOVE,BELOW,RIGHT, OR LEFT OF IT");
                    expect(inputStr).toHaveBeenCalled();
                });

                it("accepts KILL(2) and routes to function", function() {
                    inputString = "2";
                    gotWizardSpell();
                    expect(gameStateMachine.stateMode).toBe(88);
                });

                it("accepts FIND TRAPS(3) and routes to function", function() {
                    inputString = "3";
                    gotWizardSpell();
                    expect(gameStateMachine.stateMode).toBe(89);
                    expect(Q).toBe(2);
                });

                it("accepts TELEPORT(4) and routes to function", function() {
                    inputString = "4";
                    gotWizardSpell();
                    expect(gameStateMachine.stateMode).toBe(90);
                    expect(Q).toBe(2);
                });

                it("accepts CHANGE(5) and routes to function", function() {
                    inputString = "5";
                    gotWizardSpell();
                    expect(gameStateMachine.stateMode).toBe(91.5);
                    expect(Q).toBe(0);
                });

                it("accepts MAG.MISS 1(6) and routes to equivalent cleric function", function() {
                    inputString = "6";
                    gotWizardSpell();
                    expect(gameStateMachine.stateMode).toBe(83);
                    expect(Q).toBe(3);
                });

                it("accepts MAG.MISS 2(7) and routes to equivalent cleric function", function() {
                    inputString = "7";
                    gotWizardSpell();
                    expect(gameStateMachine.stateMode).toBe(80);
                    expect(Q).toBe(6);
                });

                it("accepts MAG.MISS 3(8) and routes to equivalent cleric function", function() {
                    inputString = "8";
                    gotWizardSpell();
                    expect(gameStateMachine.stateMode).toBe(84);
                    expect(Q).toBe(9);
                });

                it("accepts FIND SECRET DOORS (9) and routes to function", function() {
                    inputString = "9";
                    gotWizardSpell();
                    expect(gameStateMachine.stateMode).toBe(89);
                    expect(Q).toBe(3);
                });

                it("accepts CHANGE(10) and routes to function", function() {
                    inputString = "10";
                    gotWizardSpell();
                    expect(gameStateMachine.stateMode).toBe(91.5);
                    expect(Q).toBe(1);
                });
            });

            describe("KILL spell", function() {
                it("fails on the first 33% chance", function() {
                    randomResults = [ 1 ];
                    wizardSpellKill();
                    expect(gameStateMachine.stateMode).toBe(200);
                    expect(rnd).toHaveBeenCalled();
                    expect(terminal.println).toHaveBeenCalledWith("FAILED");
                });

                it("succeeds on the upper 66% chance", function() {
                    randomResults = [ 1.1 ];
                    wizardSpellKill();
                    expect(gameStateMachine.stateMode).toBe(200);
                    expect(rnd).toHaveBeenCalled();
                    expect(terminal.println).toHaveBeenCalledWith("DONE");
                    expect(K1).toBe(-1);
                });
            });

            describe("FIND TRAPS spell", function() {
                it("identifies any traps within a 7x7 area centred on the player", function() {
                    Q = 2;
                    wizardSpellFindTrap();
                    expect(terminal.println).toHaveBeenCalledWith("THERE IS ONE AT 3LAT.6LONG.");
                    expect(gameStateMachine.stateMode).toBe(200);
                    expect(terminal.println).toHaveBeenCalledWith("NO MORE");
                    expect(inBounds).toHaveBeenCalled();
                });
            });

            describe("TELEPORT spell", function() {
                it("prompts user for a target location on map", function() {
                    wizardSpellTeleport();
                    expect(inputX).toHaveBeenCalled();
                    expect(terminal.print).toHaveBeenCalledWith("INPUT CO-ORDINATES");
                    expect(gameStateMachine.stateMode).toBe(91);
                });

                it("accepts user input for a target location on map and moves the player to that point if in bounds", function() {
                    inputStrings = ["6", "7"];
                    gotTeleportCoordinates();
                    expect(mapX).toBe(6);
                    expect(mapY).toBe(7);
                    expect(terminal.println).toHaveBeenCalledWith("DONE");
                    expect(gameStateMachine.stateMode).toBe(200);
                });

                it("accepts user input for a target location on map and blocks the move if not in bounds", function() {
                    inputStrings = ["6", "27"];
                    gotTeleportCoordinates();
                    expect(mapX).toBe(5);
                    expect(mapY).toBe(5);
                    expect(terminal.println).toHaveBeenCalledWith("FAILED");
                    expect(gameStateMachine.stateMode).toBe(200);
                });
            });

            describe("CHANGE spell", function() {
                it("prompts the user for map coordinates", function() {
                    gotSpellChange();
                    expect(inputX).toHaveBeenCalled();
                    expect(terminal.print).toHaveBeenCalledWith("INPUT CO-ORDINATES");
                    expect(gameStateMachine.stateMode).toBe(91.6);
                });

                it("rejects map coordinates outside the bounds of the map", function() {
                    inputStrings = ["28", "1"];
                    gotChangeCoordinates();
                    expect(terminal.println).toHaveBeenCalledWith("FAILED");
                    expect(gameStateMachine.stateMode).toBe(200);
                });

                it("converts a map cell from a wall to open space", function() {
                    Q = 0;
                    inputStrings = ["6", "6"];
                    gotChangeCoordinates();
                    expect(dungeonMap[6][6]).toBe(0);
                    expect(terminal.println).toHaveBeenCalledWith("DONE");
                    expect(gameStateMachine.stateMode).toBe(200);
                });

                it("fails to convert anything but wall to open space", function() {
                    Q = 0;
                    inputStrings = ["8", "1"];
                    gotChangeCoordinates();
                    expect(dungeonMap[1][8]).toBe(4);
                    expect(terminal.println).toHaveBeenCalledWith("FAILED");
                    expect(gameStateMachine.stateMode).toBe(200);
                });

                it("converts a map cell from open space to a wall", function() {
                    Q = 1;
                    inputStrings = ["5", "6"];
                    gotChangeCoordinates();
                    expect(dungeonMap[6][5]).toBe(1);
                    expect(terminal.println).toHaveBeenCalledWith("DONE");
                    expect(gameStateMachine.stateMode).toBe(200);
                });

                it("fails to convert anything but open space to wall", function() {
                    Q = 1;
                    inputStrings = ["8", "1"];
                    gotChangeCoordinates();
                    expect(dungeonMap[1][8]).toBe(4);
                    expect(terminal.println).toHaveBeenCalledWith("FAILED");
                    expect(gameStateMachine.stateMode).toBe(200);
                });
            });

            describe("FIND SECRET DOORS spell", function() {
                it("identifies any secret doors within a 7x7 area centred on the player", function() {
                    Q = 3;
                    wizardSpellFindTrap();
                    expect(terminal.println).toHaveBeenCalledWith("THERE IS ONE AT 4LAT.3LONG.");
                    expect(terminal.println).toHaveBeenCalledWith("THERE IS ONE AT 8LAT.4LONG.");
                    expect(gameStateMachine.stateMode).toBe(200);
                    expect(terminal.println).toHaveBeenCalledWith("NO MORE");
                    expect(inBounds).toHaveBeenCalled();
                });
            });
        });

        describe("Cleric Spell Casting", function() {
            beforeEach(function () {
                clericSpellbook = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
                clericSpellCounter = 9;
                mapX = 5;
                mapY = 5;
            });

            describe("Route Spell Choice", function() {
                it("accepts user input and checks it is a valid spell choice, warns user if not", function() {
                    clericSpellbook[5] = 0;
                    inputString = "5";
                    gotClericSpell();
                    expect(gameStateMachine.stateMode).toBe(200);
                    expect(terminal.println).toHaveBeenCalledWith("YOU DONT HAVE THAT SPELL");
                });

                it("accepts KILL(1) and routes to function", function() {
                    inputString = "1";
                    gotClericSpell();
                    expect(gameStateMachine.stateMode).toBe(79);
                });

                it("accepts MAG.MISS 2(2) and routes to function", function() {
                    inputString = "2";
                    gotClericSpell();
                    expect(gameStateMachine.stateMode).toBe(80);
                });

                it("accepts CURE LIGHT WOUNDS(3) and routes to function", function() {
                    inputString = "3";
                    gotClericSpell();
                    expect(gameStateMachine.stateMode).toBe(81);
                });

                it("accepts FIND TRAPS(4) and routes to function", function() {
                    inputString = "4";
                    gotClericSpell();
                    expect(gameStateMachine.stateMode).toBe(82);
                    expect(Q).toBe(2);
                });

                it("accepts MAG.MISS 1(5) and routes to function", function() {
                    inputString = "5";
                    gotClericSpell();
                    expect(gameStateMachine.stateMode).toBe(83);
                });

                it("accepts MAG.MISS 3(6) and routes to function", function() {
                    inputString = "6";
                    gotClericSpell();
                    expect(gameStateMachine.stateMode).toBe(84);
                });

                it("accepts CURE LIGHT WOUNDS 2(7) and routes to function", function() {
                    inputString = "7";
                    gotClericSpell();
                    expect(gameStateMachine.stateMode).toBe(85);
                });

                it("accepts FIND SECRET DOORS(8) and routes to function", function() {
                    inputString = "8";
                    gotClericSpell();
                    expect(gameStateMachine.stateMode).toBe(82);
                    expect(Q).toBe(3);
                });

                it("accepts UNKNOWN(9) and routes to function", function() {
                    inputString = "9";
                    gotClericSpell();
                    expect(gameStateMachine.stateMode).toBe(86);
                });
            });
        });
    });
});