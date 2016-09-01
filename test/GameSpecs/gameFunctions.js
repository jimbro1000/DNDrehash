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
});