/**
 * Created by Julian on 27/08/2016.
 */
describe("Game Functions", function() {
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
                expect(monsterStats[currentMonster][constants.monsterHp]).toBe(0);
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
            currentWeaponIndex = 0;
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
                currentWeaponIndex = 1;
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
                loadMonsters();
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

            describe("KILL spell", function() {
                it("is removed from the cleric spellbook after casting", function() {
                    M = 1;
                    clericSpellKill();
                    expect(clericSpellbook[M]).toBe(0);
                });

                it("fails on the upper 66% chance", function() {
                    randomResults = [ 1.1 ];
                    clericSpellKill();
                    expect(gameStateMachine.stateMode).toBe(200);
                    expect(rnd).toHaveBeenCalled();
                    expect(terminal.println).toHaveBeenCalledWith("FAILED");
                });

                it("succeeds on the first 33% chance", function() {
                    randomResults = [ 1 ];
                    K1 = 1;
                    clericSpellKill();
                    expect(gameStateMachine.stateMode).toBe(200);
                    expect(rnd).toHaveBeenCalled();
                    expect(terminal.println).toHaveBeenCalledWith("DONE");
                    expect(K1).toBe(-1);
                });
            });

            describe("MAGIC MISSLE 2 spell", function() {
                it("is removed from the cleric spellbook after casting", function() {
                    M = 2;
                    currentMonster = 1;
                    clericSpellMagicMissileAdvanced();
                    expect(clericSpellbook[M]).toBe(0);
                });

                it("decreases the health of the current monster by 4", function() {
                    currentMonster = 1;
                    M = 2;
                    monsterStats[currentMonster][constants.monsterHp] = 10;
                    clericSpellMagicMissileAdvanced();
                    expect(monsterStats[currentMonster][constants.monsterHp]).toBe(6);
                });

                it("notifies the player that the action is complete", function() {
                    currentMonster = 1;
                    M = 2;
                    clericSpellMagicMissileAdvanced();
                    expect(terminal.println).toHaveBeenCalledWith("DONE");
                    expect(gameStateMachine.stateMode).toBe(200);
                });
            });

            describe("CURE LIGHT WOUNDS 1 spell", function() {
                beforeEach(function() {
                    M = 3;
                    clericSpellbook[M] = 3;
                    attributes[constants.playerCon] = 10;
                    clericSpellCureLight();
                });

                it("is removed from the cleric spellbook after casting", function() {
                    expect(clericSpellbook[M]).toBe(0);
                });

                it("increases the constitution of the player by 3", function() {
                    expect(attributes[constants.playerCon]).toBe(13);
                });

                it("routes control to the main loop", function() {
                    expect(gameStateMachine.stateMode).toBe(200);
                });
            });

            describe("FIND TRAPS spell", function() {
                beforeEach(function() {
                    Q = 2;
                    M = 4; // M is destroyed by the spell function
                });

                it("is removed from the cleric spellbook after casting", function() {
                    clericSpellFindTraps();
                    expect(clericSpellbook[4]).toBe(0);
                });

                it("reports findings to the player", function() {
                    clericSpellFindTraps();
                    expect(terminal.println).toHaveBeenCalledWith("THERE IS ONE AT 3LAT.6LONG.");
                    expect(terminal.println).toHaveBeenCalledWith("NO MORE");
                });

                it("routes control to the main loop", function() {
                    clericSpellFindTraps();
                    expect(gameStateMachine.stateMode).toBe(200);
                });
            });

            describe("MAGIC MISSLE 1 spell", function() {
                beforeEach(function() {
                    M = 5;
                    currentMonster = 1;
                });

                it("is removed from the cleric spellbook after casting", function() {
                    clericSpellMagicMissile();
                    expect(clericSpellbook[M]).toBe(0);
                });

                it("decreases the health of the current monster by 2", function() {
                    monsterStats[currentMonster][constants.monsterHp] = 10;
                    clericSpellMagicMissile();
                    expect(monsterStats[currentMonster][constants.monsterHp]).toBe(8);
                });

                it("notifies the player that the action is complete", function() {
                    clericSpellMagicMissile();
                    expect(terminal.println).toHaveBeenCalledWith("DONE");
                    expect(gameStateMachine.stateMode).toBe(200);
                });
            });

            describe("MAGIC MISSLE 3 spell", function() {
                beforeEach(function() {
                    M = 6;
                    currentMonster = 1;
                });

                it("is removed from the cleric spellbook after casting", function() {
                    clericSpellMagicMissileUltimate();
                    expect(clericSpellbook[M]).toBe(0);
                });

                it("decreases the health of the current monster by 6", function() {
                    monsterStats[currentMonster][constants.monsterHp] = 10;
                    clericSpellMagicMissileUltimate();
                    expect(monsterStats[currentMonster][constants.monsterHp]).toBe(4);
                });

                it("notifies the player that the action is complete", function() {
                    clericSpellMagicMissileUltimate();
                    expect(terminal.println).toHaveBeenCalledWith("DONE");
                    expect(gameStateMachine.stateMode).toBe(200);
                });
            });

            describe("CURE LIGHT WOUNDS 2 spell", function() {
                beforeEach(function() {
                    M = 7;
                    attributes[constants.playerCon] = 10;
                    clericSpellCureLightAdvanced();
                });

                it("is stays in the cleric spellbook after casting", function() {
                    expect(clericSpellbook[M]).toBe(7);
                });

                it("increases the constitution of the player by 3", function() {
                    expect(attributes[constants.playerCon]).toBe(13);
                });

                it("routes control to the main loop", function() {
                    expect(gameStateMachine.stateMode).toBe(200);
                });
            });

            describe("FIND SECRET DOORS spell", function() {
                beforeEach(function() {
                    Q = 3;
                    M = 8;
                });

                it("is removed from the cleric spellbook after casting", function() {
                    clericSpellFindTraps();
                    expect(clericSpellbook[8]).toBe(0);
                });

                it("reports findings to the player", function() {
                    clericSpellFindTraps();
                    expect(terminal.println).toHaveBeenCalledWith("THERE IS ONE AT 4LAT.3LONG.");
                    expect(terminal.println).toHaveBeenCalledWith("THERE IS ONE AT 8LAT.4LONG.");
                    expect(terminal.println).toHaveBeenCalledWith("NO MORE");
                });

                it("routes control to the main loop", function() {
                    clericSpellFindTraps();
                    expect(gameStateMachine.stateMode).toBe(200);
                });
            });

            xdescribe("spell 9 (undefined)", function() {
                // this spell is incomplete with no definable result and cannot be purchased
                // original code suggests this would be a turn undead as it checks for skeleton or mummy as the current monster
                xit("only affects a skeleton or mummy");
            });
        });
    });

    describe("Actions", function() {
        beforeEach(function() {
            terminal = {
                lastInput : ""
            };
            terminal.println = function(value) { this.lastInput = value; };
            terminal.print = function(value) { this.lastInput = value; };
            gameStateMachine = {
                stateMode : 1,
                waitTransition : false
            };
            attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
            defaultMap();
            loadMonsters();
            spyOn(terminal,"println").and.callThrough();
            spyOn(terminal,"print").and.callThrough();
            spyOn(window,"inBounds").and.callThrough();
            spyOn(window, "inputStr").and.stub();
            spyOn(window, "input").and.stub();
        });

        describe("Looking", function() {
            it("displays the map around the player with a range of 5", function() {
                mapY = 3;
                mapX = 3;
                looking();
                expect(inBounds).toHaveBeenCalled();
                expect(terminal.println).toHaveBeenCalledWith("100910001");
            });

            it("treats secret doors as walls", function() {
                mapY = 2;
                mapX = 11;
                looking();
                expect(terminal.println).toHaveBeenCalledWith("00400010161");
                expect(terminal.println).not.toHaveBeenCalledWith("00400030161");
            });

            it("treats traps as open space", function() {
                mapY = 4;
                mapX = 5;
                looking();
                expect(terminal.println).toHaveBeenCalledWith("10001000100");
                expect(terminal.println).not.toHaveBeenCalledWith("10001020100");
            });

            it("treats boosts(7) as open space", function() {
                mapY = 4;
                mapX = 5;
                dungeonMap[3][1] = 7;
                looking();
                expect(terminal.println).toHaveBeenCalledWith("10001000100");
                expect(terminal.println).not.toHaveBeenCalledWith("17001000100");
            });

            it("treats boosts(8) as open space", function() {
                mapY = 4;
                mapX = 5;
                dungeonMap[3][1] = 8;
                looking();
                expect(terminal.println).toHaveBeenCalledWith("10001000100");
                expect(terminal.println).not.toHaveBeenCalledWith("18001000100");
            });
        });

        describe("Consume Food after baiting monster", function() {
            it("uses up food from the inventory and empties the hands of the player", function() {
                inventory[1] = 15;
                inventoryCounter = 1;
                currentWeaponIndex = 1;
                Z5 = 0;
                consumeFood();
                expect(inventory[1]).toBe(0);
                expect(getCurrentWeapon()).toBe(0);
                expect(gameStateMachine.stateMode).toBe(200);
            });

            it("doesn't use food or empty the hands of the player if a spell was cast", function() {
                inventory[1] = 15;
                inventoryCounter = 1;
                currentWeaponIndex = 1;
                Z5 = 1;
                consumeFood();
                expect(inventory[1]).toBe(15);
                expect(getCurrentWeapon()).toBe(15);
                expect(gameStateMachine.stateMode).toBe(200);
            });
        });

        describe("Bait monster", function() {
            describe("accepts user input to determine the direction to bait in", function() {
                it("accepts B to move up a row", function() {
                    F1 = 5;
                    F2 = 5;
                    inputString = "B";
                    kiteMonster();
                    expect(S).toBe(-1);
                    expect(T).toBe(0);
                });

                it("accepts A to move down a row", function() {
                    F1 = 5;
                    F2 = 5;
                    inputString = "A";
                    kiteMonster();
                    expect(S).toBe(1);
                    expect(T).toBe(0);
                });

                it("accepts L to move left a column", function() {
                    F1 = 5;
                    F2 = 5;
                    inputString = "L";
                    kiteMonster();
                    expect(S).toBe(0);
                    expect(T).toBe(-1);
                });

                it("accepts R to move right a column", function() {
                    F1 = 5;
                    F2 = 5;
                    inputString = "R";
                    kiteMonster();
                    expect(S).toBe(0);
                    expect(T).toBe(1);
                });
            });

            it("checks to see if the target space is open", function() {
                F1 = 5;
                F2 = 5;
                inputString = "A";
                dungeonMap[F1][F2] = 5;
                kiteMonster();
                expect(F1).toBe(6);
                expect(F2).toBe(5);
                expect(dungeonMap[5][5]).toBe(0);
                expect(dungeonMap[F1][F2]).toBe(5);
                expect(terminal.println).toHaveBeenCalledWith("MONSTER MOVED BACK");
            });

            it("checks to see if the target space is a trap", function() {
                F1 = 3;
                F2 = 5;
                dungeonMap[F1][F2] = 5;
                inputString = "R";
                currentMonster = 1;
                kiteMonster();
                expect(F1).toBe(3);
                expect(F2).toBe(5);
                expect(dungeonMap[F1][F2]).toBe(0);
                expect(K1).toBe(-1);
                expect(terminal.println).toHaveBeenCalledWith("GOOD WORK THE MONSTER FELL INTO A TRAP AND IS DEAD");
                expect(monsterStats[currentMonster][constants.monsterHp]).toBe(0);
            });

            it("checks to see if the target space is blocked", function() {
                F1 = 3;
                F2 = 5;
                dungeonMap[F1][F2] = 5;
                inputString = "B";
                currentMonster = 1;
                kiteMonster();
                expect(F1).toBe(3);
                expect(F2).toBe(5);
                expect(dungeonMap[F1][F2]).toBe(5);
                expect(terminal.println).toHaveBeenCalledWith("DIDN'T WORK");
            });

            it("routes to consume food", function() {
                F1 = 5;
                F2 = 5;
                inputString = "X";
                kiteMonster();
                expect(gameStateMachine.stateMode).toBe(74);
            });
        });

        describe("Pelt monster", function() {
            var randomResults = [];
            var randomIndex = 0;
            beforeEach(function(){
                randomIndex = 0;
                spyOn(window,"rnd").and.callFake(function() { console.log(randomResults[randomIndex]); return randomResults[randomIndex++]; })
            });

            it("checks for a perfect direct hit", function() {
                randomResults = [19];
                currentMonster = 1;
                monsterStats[currentMonster][constants.monsterHp] = 20;
                peltMonster();
                expect(terminal.println).toHaveBeenCalledWith("DIRECT HIT");
                expect(monsterStats[currentMonster][constants.monsterHp]).toBe(19);
            });

            it("checks for a damaging hit", function() {
                randomResults = [18, 9];
                currentMonster = 1;
                monsterStats[currentMonster][constants.monsterHp] = 20;
                peltMonster();
                expect(terminal.println).toHaveBeenCalledWith("HIT");
                expect(monsterStats[currentMonster][constants.monsterHp]).toBe(19);
            });

            it("checks for a non-damaging weak hit", function() {
                randomResults = [18, 8, 19];
                currentMonster = 1;
                monsterStats[currentMonster][constants.monsterHp] = 20;
                peltMonster();
                expect(terminal.println).toHaveBeenCalledWith("YOU HIT HIM BUT NOT GOOD ENOUGH");
                expect(monsterStats[currentMonster][constants.monsterHp]).toBe(20);
            });

            it("checks for a miss", function() {
                randomResults = [18, 0, 0];
                currentMonster = 1;
                monsterStats[currentMonster][constants.monsterHp] = 20;
                peltMonster();
                expect(terminal.println).toHaveBeenCalledWith("TOTAL MISS");
                expect(monsterStats[currentMonster][constants.monsterHp]).toBe(20);
            });

            it("routes to consume food", function() {
                randomResults = [18, 1, 1];
                currentMonster = 1;
                peltMonster();
                expect(gameStateMachine.stateMode).toBe(74);
            });
        });

        describe("Consume Weapon", function () {
            it("checks if the current weapon is a silver cross, leaves it inventory, equipped and routes to monster loop", function() {
                currentWeaponIndex = 1;
                inventory[1] = 14;
                inventoryCounter = 1;
                consumeWpn();
                expect(inventory[1]).toBe(14);
                expect(getCurrentWeapon()).toBe(14);
                expect(gameStateMachine.stateMode).toBe(200);
            });

            it("checks for arrows and removes one arrow but retains the current weapon", function() {
                currentWeaponIndex = 1;
                inventory[1] = 7;
	            inventory[2] = 7;
                inventoryCounter = 2;
                consumeWpn();
                expect(inventory[1]).toBe(0);
                expect(getCurrentWeapon()).toBe(7);
            });

            it("removes the weapon from the players inventory and hands", function() {
                currentWeaponIndex = 1;
                inventory[1] = 8;
                inventoryCounter = 1;
                consumeWpn();
                expect(inventory[1]).toBe(0);
                expect(getCurrentWeapon()).toBe(0);
            });

            it("tests toHitRoll and routes to the main user loop if > 0", function() {
                toHitRoll = 1;
                currentWeaponIndex = 1;
                inventory[1] = 8;
                inventoryCounter = 1;
                consumeWpn();
                expect(gameStateMachine.stateMode).toBe(25);
            });

            it("tests toHitRoll and routes to the monster loop if <= 0", function() {
                toHitRoll = 0;
                currentWeaponIndex = 8;
                inventory[1] = 8;
                inventoryCounter = 1;
                consumeWpn();
                expect(gameStateMachine.stateMode).toBe(200);
            });
        });

        describe("Got Silver Cross as Weapon", function() { //70
            it("accepts user input 'SIGHT' and hurts monster if in range", function() {
                inputString = "SIGHT";
	            inventory[1] = 14;
	            inventoryCounter = 1;
                currentWeaponIndex = 1; // silver cross
                currentMonster = 1;
                range = 9;
                R3 = 4;
                gotSilverCross();
                expect(terminal.println).toHaveBeenCalledWith("THE MONSTER IS HURT");
                expect(gameStateMachine.stateMode).toBe(69);
                expect(R5).toBe(1/6);
                expect(toHitRoll).toBe(1);
                expect(range).toBe(3);
            });

            it("accepts user input 'SIGHT' and fails if out of range", function() {
                inputString = "SIGHT";
	            inventory[1] = 14;
	            inventoryCounter = 1;
	            currentWeaponIndex = 1; // silver cross
                currentMonster = 1;
                range = 10;
                gotSilverCross();
                expect(terminal.println).toHaveBeenCalledWith("FAILED");
                expect(gameStateMachine.stateMode).toBe(200);
            });

            it("damages skeletons", function() {
                inputString = "SIGHT";
	            inventory[1] = 14;
	            inventoryCounter = 1;
	            currentWeaponIndex = 1; // silver cross
                range = 9;
                currentMonster = 4;
                gotSilverCross();
                expect(toHitRoll).toBe(3);
            });

            it("damages mummies", function() {
                inputString = "SIGHT";
	            inventory[1] = 14;
	            inventoryCounter = 1;
	            currentWeaponIndex = 1; // silver cross
                range = 9;
                currentMonster = 10;
                gotSilverCross();
                expect(toHitRoll).toBe(3);
            });

            it("damages goblins", function() {
                inputString = "SIGHT";
	            inventory[1] = 14;
	            inventoryCounter = 1;
	            currentWeaponIndex = 1; // silver cross
                range = 9;
                currentMonster = 2;
                gotSilverCross();
                expect(toHitRoll).toBe(3);
            });
        });

        describe("Resolve improvised attack", function() {
            it("checks if the target is in striking distance", function() {
                R3 = 2;
                range = 3;
                resolveImprov();
                expect(gameStateMachine.stateMode).toBe(200);
                expect(terminal.println).toHaveBeenCalledWith("HE IS OUT OF RANGE");
            });

            describe("reports the outcome if the target is in range", function () {
                it("and recognises a miss", function() {
                    R3 = 3;
                    range = 2;
                    toHitRoll = 0;
                    resolveImprov();
                    expect(gameStateMachine.stateMode).toBe(71);
                    expect(terminal.println).toHaveBeenCalledWith("MISS");
                });

                it("and recognises an ineffective hit", function() {
                    R3 = 3;
                    range = 2;
                    toHitRoll = 1;
                    resolveImprov();
                    expect(gameStateMachine.stateMode).toBe(71);
                    expect(terminal.println).toHaveBeenCalledWith("HIT BUT NO DAMAGE");
                });

                it("and recognises a damaging hit", function() {
                    R3 = 3;
                    range = 2;
                    toHitRoll = 2;
                    R4 = 1;
                    currentMonster = 1;
                    resolveImprov();
                    expect(gameStateMachine.stateMode).toBe(71);
                    expect(terminal.println).toHaveBeenCalledWith("HIT");
                    expect(monsterStats[currentMonster][constants.monsterHp]).toBe(16);
                });

                it("and recognises a critical hit", function() {
                    R3 = 3;
                    range = 2;
                    toHitRoll = 3;
                    R5 = 2;
                    currentMonster = 1;
                    resolveImprov();
                    expect(gameStateMachine.stateMode).toBe(71);
                    expect(terminal.println).toHaveBeenCalledWith("CRITICAL HIT");
                    expect(monsterStats[currentMonster][constants.monsterHp]).toBe(6);
                });
            });
        });

        describe("knuckle head resolves an unarmed attack", function() {
            it("and accepts user input YES to cancel the attack", function() {
                inputString = "YES";
                knucklehead();
                expect(gameStateMachine.stateMode).toBe(25);
                expect(terminal.println).not.toHaveBeenCalled();
            });

            it("and admires shadow boxing", function() {
                inputString = "NO";
                mapY = 1;
                mapX = 1;
                knucklehead();
                expect(gameStateMachine.stateMode).toBe(25);
                expect(terminal.println).toHaveBeenCalledWith("O.K. PUNCH BITE SCRATCH HIT ........");
                expect(terminal.println).toHaveBeenCalledWith("NO GOOD ONE");
            });

            it("and checks for a miss if a monster is near", function() {
                spyOn(window, "rnd").and.callFake(function() { return 0; });
                inputString = "NO";
                mapY = 1;
                mapX = 1;
                dungeonMap[1][2] = 5;
                knucklehead();
                expect(gameStateMachine.stateMode).toBe(200);
                expect(terminal.println).toHaveBeenCalledWith("O.K. PUNCH BITE SCRATCH HIT ........");
                expect(terminal.println).toHaveBeenCalledWith("TERRIBLE NO GOOD");
            });

            it("and checks for a hit if a monster is near", function() {
                spyOn(window, "rnd").and.callFake(function() { return 0.999; });
                inputString = "NO";
                mapY = 1;
                mapX = 1;
                dungeonMap[1][2] = 5;
                currentMonster = 1;
                knucklehead();
                expect(gameStateMachine.stateMode).toBe(25);
                expect(terminal.println).toHaveBeenCalledWith("O.K. PUNCH BITE SCRATCH HIT ........");
                expect(terminal.println).toHaveBeenCalledWith("GOOD A HIT");
                expect(monsterStats[currentMonster][constants.monsterHp]).toBe(25);
            });
        });

        describe("throw food checks how the food is used as a weapon", function() { //67
            it("and checks if the user wants to just hit with the food", function() {
                inputString = "HIT";
                throwFood();
                expect(gameStateMachine.stateMode).toBe(72);
            });

            it("and asks where the food will be thrown", function() {
                Z5 = 1;
                inputString = "THROW";
                throwFood();
                expect(gameStateMachine.stateMode).toBe(73);
                expect(Z5).toBe(0);
                expect(terminal.print).toHaveBeenCalledWith("THROW A-ABOVE,B-BELOW,L-LEFT,OR R-RIGHT OF THE MONSTER");
                expect(inputStr).toHaveBeenCalled();
            });
        });

        describe("improvise routes the weapon choice", function() { //66
            it("and makes sure the chosen weapon is held", function() {
                inventory[1] = 15;
                inventoryCounter = 1;
                currentWeaponIndex = -1;
                improvise();
                expect(gameStateMachine.stateMode).toBe(25);
                expect(terminal.println).toHaveBeenCalledWith("NO WEAPON FOUND");
            });

            it("and configures for a spear", function() {
                R3 = 0;
                R4 = 0;
                R5 = 0;
                inventory[1] = 5;
                inventoryCounter = 1;
                currentWeaponIndex = 1;
                improvise();
                expect(gameStateMachine.stateMode).toBe(69);
                expect(R3).toBe(10);
                expect(R4).toBe(3/7);
                expect(R5).toBe(5/11);
            });

            it("and configures for a bow without any arrows", function() {
                R3 = 0;
                R4 = 0;
                R5 = 0;
                inventory[0] = 0;
                inventory[1] = 6;
                inventory[2] = 0;
                inventoryCounter = 2;
                currentWeaponIndex = 1;
                improvise();
                expect(gameStateMachine.stateMode).toBe(71);
                expect(terminal.println).toHaveBeenCalledWith("MISS");
                expect(R3).toBe(15);
                expect(R4).toBe(3/7);
                expect(R5).toBe(5/11);
            });


            it("and configures for a bow and arrow", function() {
                R3 = 0;
                R4 = 0;
                R5 = 0;
                inventory[0] = 7;
                inventory[1] = 6;
                inventoryCounter = 1;
                currentWeaponIndex = 1;
                improvise();
                expect(gameStateMachine.stateMode).toBe(69);
                expect(R3).toBe(15);
                expect(R4).toBe(3/7);
                expect(R5).toBe(5/11);
            });

            it("and configures for just an arrow", function() {
                R3 = 0;
                R4 = 0;
                R5 = 0;
                inventory[1] = 7;
                inventoryCounter = 1;
                currentWeaponIndex = 1;
                improvise();
                expect(gameStateMachine.stateMode).toBe(69);
                expect(R3).toBe(1.5);
                expect(R4).toBe(1/7);
                expect(R5).toBe(1/5);
            });

            it("and configures for leather armour", function() {
                R3 = 0;
                R4 = 0;
                R5 = 0;
                inventory[1] = 8;
                inventoryCounter = 1;
                currentWeaponIndex = 1;
                improvise();
                expect(gameStateMachine.stateMode).toBe(69);
                expect(R3).toBe(4);
                expect(R4).toBe(1/10);
                expect(R5).toBe(1/8);
            });

            it("and configures for chain mail armour", function() {
                R3 = 0;
                R4 = 0;
                R5 = 0;
                inventory[1] = 9;
                inventoryCounter = 1;
                currentWeaponIndex = 1;
                improvise();
                expect(gameStateMachine.stateMode).toBe(69);
                expect(R3).toBe(4);
                expect(R4).toBe(1/7);
                expect(R5).toBe(1/6);
            });

            it("and configures for plate mail armour", function() {
                R3 = 0;
                R4 = 0;
                R5 = 0;
                inventory[1] = 10;
                inventoryCounter = 1;
                currentWeaponIndex = 1;
                improvise();
                expect(gameStateMachine.stateMode).toBe(69);
                expect(R3).toBe(3);
                expect(R4).toBe(1/8);
                expect(R5).toBe(1/5);
            });

            it("and configures for rope", function() {
                R3 = 0;
                R4 = 0;
                R5 = 0;
                inventory[1] = 11;
                inventoryCounter = 1;
                currentWeaponIndex = 1;
                improvise();
                expect(gameStateMachine.stateMode).toBe(69);
                expect(R3).toBe(5);
                expect(R4).toBe(1/9);
                expect(R5).toBe(1/6);
            });

            it("and configures for a spike", function() {
                R3 = 0;
                R4 = 0;
                R5 = 0;
                inventory[1] = 12;
                inventoryCounter = 1;
                currentWeaponIndex = 1;
                improvise();
                expect(gameStateMachine.stateMode).toBe(69);
                expect(R3).toBe(8);
                expect(R4).toBe(1/9);
                expect(R5).toBe(1/4);
            });

            it("and configures for a flask of oil", function() {
                R3 = 0;
                R4 = 0;
                R5 = 0;
                inventory[1] = 13;
                inventoryCounter = 1;
                currentWeaponIndex = 1;
                improvise();
                expect(gameStateMachine.stateMode).toBe(69);
                expect(R3).toBe(6);
                expect(R4).toBe(1/3);
                expect(R5).toBe(2/3);
            });

            it("and asks how to use a silver cross", function() {
                inventory[1] = 14;
                inventoryCounter = 1;
                currentWeaponIndex = 1;
                improvise();
                expect(gameStateMachine.stateMode).toBe(70);
                expect(terminal.print).toHaveBeenCalledWith("AS A CLUB OR SIGHT");
                expect(inputStr).toHaveBeenCalled();
            });
        });

        describe("swingAMace resolves melee with a mace", function() { //65
            beforeEach(function() {
                spyOn(window,"findRange").and.stub();
            });

            it("and calculates range first to make sure a hit is possible", function() {
                range = 3;
                swingAMace();
                expect(terminal.println).toHaveBeenCalledWith("SWING");
                expect(findRange).toHaveBeenCalled();
            });

            it("and tells the player if out of range", function() {
                range = 2;
                swingAMace();
                expect(terminal.println).toHaveBeenCalledWith("HE IS OUT OF RANGE");
                expect(gameStateMachine.stateMode).toBe(200);
            });

            describe("and in range checks the toHitRoll", function() {
                it("0 is a miss", function() {
                    range = 1;
                    toHitRoll = 0;
                    swingAMace();
                    expect(terminal.println).toHaveBeenCalledWith("MISS");
                    expect(gameStateMachine.stateMode).toBe(200);
                });

                it("1 is a glancing blow", function() {
                    range = 1;
                    toHitRoll = 1;
                    swingAMace();
                    expect(terminal.println).toHaveBeenCalledWith("HIT BUT NO DAMAGE");
                    expect(gameStateMachine.stateMode).toBe(25);
                });

                it("2 is a good hit and damages the target", function() {
                    range = 1;
                    toHitRoll = 2;
                    currentMonster = 1;
                    swingAMace();
                    expect(terminal.println).toHaveBeenCalledWith("HIT");
                    expect(gameStateMachine.stateMode).toBe(25);
                    expect(monsterStats[currentMonster][constants.monsterHp]).toBe(26 - int(10 * 5 / 11));
                });

                it("3 is a critical hit and damages the target", function() {
                    range = 1;
                    toHitRoll = 3;
                    currentMonster = 1;
                    swingAMace();
                    expect(terminal.println).toHaveBeenCalledWith("CRITICAL HIT");
                    expect(gameStateMachine.stateMode).toBe(25);
                    expect(monsterStats[currentMonster][constants.monsterHp]).toBe(26 - int(10 * 4 / 9));
                });
            });
        });

        describe("pokeADagger resolves combat with a dagger", function() { //64
            beforeEach(function() {
                spyOn(window,"findRange").and.stub();
            });

            it("checks to make sure a dagger is wielded", function() {
                inventory[1] = 2;
                inventoryCounter = 1;
                currentWeaponIndex = 1;
                spyOn(window,"getCurrentWeapon").and.callThrough();
                pokeADagger();
                expect(getCurrentWeapon).toHaveBeenCalled();
                expect(terminal.println).toHaveBeenCalledWith("YOU DONT HAVE A DAGGER");
            });

            it("and tells the player if out of range", function() {
                inventory[1] = 3;
                inventoryCounter = 1;
                currentWeaponIndex = 1;
                range = 6;
                pokeADagger();
                expect(terminal.println).toHaveBeenCalledWith("HE IS OUT OF RANGE");
                expect(gameStateMachine.stateMode).toBe(200);
            });

            describe("and if in range checks the toHitRoll", function() {
                it("0 is a miss", function() {
                    inventory[1] = 3;
                    inventoryCounter = 1;
                    currentWeaponIndex = 1;
                    range = 1;
                    toHitRoll = 0;
                    pokeADagger();
                    expect(terminal.println).toHaveBeenCalledWith("MISSED TOTALLY");
                    expect(gameStateMachine.stateMode).toBe(200);
                });

                it("1 is a glancing blow", function() {
                    inventory[1] = 3;
                    inventoryCounter = 1;
                    currentWeaponIndex = 1;
                    range = 1;
                    toHitRoll = 1;
                    pokeADagger();
                    expect(terminal.println).toHaveBeenCalledWith("HIT BUT NO DAMAGE");
                    expect(gameStateMachine.stateMode).toBe(200);
                });

                it("2 is a good hit and damages the target", function() {
                    inventory[1] = 3;
                    inventoryCounter = 1;
                    currentWeaponIndex = 1;
                    range = 1;
                    toHitRoll = 2;
                    currentMonster = 1;
                    pokeADagger();
                    expect(terminal.println).toHaveBeenCalledWith("HIT");
                    expect(gameStateMachine.stateMode).toBe(200);
                    expect(monsterStats[currentMonster][constants.monsterHp]).toBe(26 - int(10 / 4));
                });

                it("3 is a critical hit and damages the target", function() {
                    inventory[1] = 3;
                    inventoryCounter = 1;
                    currentWeaponIndex = 1;
                    range = 1;
                    toHitRoll = 3;
                    currentMonster = 1;
                    pokeADagger();
                    expect(terminal.println).toHaveBeenCalledWith("CRITICAL HIT");
                    expect(gameStateMachine.stateMode).toBe(200);
                    expect(monsterStats[currentMonster][constants.monsterHp]).toBe(26 - int(10 * 3 / 10));
                });
            });

            it("and if the range is greater than 2 consume the dagger", function() {
                inventory[1] = 3;
                inventory[2] = 3;
                inventoryCounter = 2;
                currentWeaponIndex = 1;
                range = 3;
                toHitRoll = 0;
                pokeADagger();
                expect(inventory[1]).toBe(0);
                expect(getCurrentWeapon()).toBe(3);
            });
        });

        describe("swingABigSword resolves melee with a long sword", function() { //63
            beforeEach(function() {
                spyOn(window,"findRange").and.stub();
            });

            it("and calculates range first to make sure a hit is possible", function() {
                range = 3;
                swingABigSword();
                expect(terminal.println).toHaveBeenCalledWith("SWING");
                expect(findRange).toHaveBeenCalled();
            });

            it("and tells the player if out of range", function() {
                range = 3;
                swingABigSword();
                expect(terminal.println).toHaveBeenCalledWith("HE IS OUT OF RANGE");
                expect(gameStateMachine.stateMode).toBe(200);
            });

            describe("and in range checks the toHitRoll", function() {
                it("0 is a miss", function() {
                    range = 1;
                    toHitRoll = 0;
                    swingABigSword();
                    expect(terminal.println).toHaveBeenCalledWith("MISSED TOTALY");
                    expect(gameStateMachine.stateMode).toBe(200);
                });

                it("1 is a glancing blow", function() {
                    range = 1;
                    toHitRoll = 1;
                    swingABigSword();
                    expect(terminal.println).toHaveBeenCalledWith("HIT BUT NOT WELL ENOUGH");
                    expect(gameStateMachine.stateMode).toBe(25);
                });

                it("2 is a good hit and damages the target", function() {
                    range = 1;
                    toHitRoll = 2;
                    currentMonster = 1;
                    swingABigSword();
                    expect(terminal.println).toHaveBeenCalledWith("HIT");
                    expect(gameStateMachine.stateMode).toBe(25);
                    expect(monsterStats[currentMonster][constants.monsterHp]).toBe(26 - int(10 * 5 / 7));
                });

                it("3 is a critical hit and damages the target", function() {
                    range = 1;
                    toHitRoll = 3;
                    currentMonster = 1;
                    swingABigSword();
                    expect(terminal.println).toHaveBeenCalledWith("CRITICAL HIT");
                    expect(gameStateMachine.stateMode).toBe(25);
                    expect(monsterStats[currentMonster][constants.monsterHp]).toBe(26 - 10);
                });
            });
        });

        describe("swingASword resolves melee with a sword", function() { //62
            beforeEach(function() {
                spyOn(window,"findRange").and.stub();
            });

            it("and calculates range first to make sure a hit is possible", function() {
                range = 3;
                swingASword();
                expect(terminal.println).toHaveBeenCalledWith("SWING");
                expect(findRange).toHaveBeenCalled();
            });

            it("and tells the player if out of range", function() {
                range = 2;
                swingASword();
                expect(terminal.println).toHaveBeenCalledWith("HE IS OUT OF RANGE");
                expect(gameStateMachine.stateMode).toBe(200);
            });

            describe("and in range checks the toHitRoll", function() {
                it("0 is a miss", function() {
                    range = 1;
                    toHitRoll = 0;
                    swingASword();
                    expect(terminal.println).toHaveBeenCalledWith("MISSED TOTALY");
                    expect(gameStateMachine.stateMode).toBe(200);
                });

                it("1 is a glancing blow", function() {
                    range = 1;
                    toHitRoll = 1;
                    swingASword();
                    expect(terminal.println).toHaveBeenCalledWith("NOT GOOD ENOUGH");
                    expect(gameStateMachine.stateMode).toBe(25);
                });

                it("2 is a good hit and damages the target", function() {
                    range = 1;
                    toHitRoll = 2;
                    currentMonster = 1;
                    swingASword();
                    expect(terminal.println).toHaveBeenCalledWith("GOOD HIT");
                    expect(gameStateMachine.stateMode).toBe(25);
                    expect(monsterStats[currentMonster][constants.monsterHp]).toBe(26 - int(10 * 4 / 5));
                });

                it("3 is a critical hit and damages the target", function() {
                    range = 1;
                    toHitRoll = 3;
                    currentMonster = 1;
                    swingASword();
                    expect(terminal.println).toHaveBeenCalledWith("CRITICAL HIT");
                    expect(gameStateMachine.stateMode).toBe(25);
                    expect(monsterStats[currentMonster][constants.monsterHp]).toBe(26 - int(10 / 2));
                });
            });
        });

        describe("knuckles tells the user that a weapon is not equipped", function() { //61
            it("and checks to proceed with an attack", function() {
                knuckles();
                expect(terminal.println).toHaveBeenCalledWith("DO YOU REALIZE YOU ARE BARE HANDED");
                expect(terminal.print).toHaveBeenCalledWith("DO YOU WANT TO MAKE ANOTHER CHOICE");
                expect(gameStateMachine.stateMode).toBe(68);
                expect(inputStr).toHaveBeenCalled();
            });
        });

        describe("resolveFight routes outcome according to equipped weapon", function() { //60
            beforeEach(function() {
                equipmentNames = ["", "SWORD", "2-H-SWORD", "DAGGER", "MACE", "SPEAR", "BOW", "ARROWS", "LEATHER MAIL", "CHAIN MAIL", "PLATE MAIL", "ROPE", "SPIKES", "FLASK OF OIL", "SILVER CROSS", "SPARE FOOD"];
                inventory[1] = 1;
                inventoryCounter = 1;
                currentWeaponIndex = 1;
            });

            it("checks a weapon is equipped", function() {
                currentMonster = 0;
                resolveFight();
                expect(terminal.println).toHaveBeenCalledWith("YOUR WEAPON IS SWORD");
            });

            it("stops the attack if there are no monsters around", function() {
                currentMonster = 0;
                resolveFight();
                expect(gameStateMachine.stateMode).toBe(25);
            });

            it("notifies current target and health", function() {
                currentMonster = 1;
                resolveFight();
                expect(terminal.println).toHaveBeenCalledWith(monsterNames[currentMonster]);
                expect(terminal.println).toHaveBeenCalledWith("HP=" + monsterStats[currentMonster][3]);
            });

            it("handles bare hand attacks", function() {
                currentMonster = 1;
                currentWeaponIndex = -1;
                resolveFight();
                expect(gameStateMachine.stateMode).toBe(61);
            });

            it("handles attacks with a sword", function() {
                currentMonster = 1;
                resolveFight();
                expect(gameStateMachine.stateMode).toBe(62);
            });

            it("handles attacks with a 2-h sword", function() {
                currentMonster = 1;
                inventory[1] = 2;
                resolveFight();
                expect(gameStateMachine.stateMode).toBe(63);
            });

            it("handles attacks with a dagger", function() {
                currentMonster = 1;
                inventory[1] = 3;
                resolveFight();
                expect(gameStateMachine.stateMode).toBe(64);
            });

            it("handles attacks with a mace", function() {
                currentMonster = 1;
                inventory[1] = 4;
                resolveFight();
                expect(gameStateMachine.stateMode).toBe(65);
            });

            it("handles attacks with food and asks if you really want to use it", function() {
                currentMonster = 1;
                inventory[1] = 15;
                resolveFight();
                expect(gameStateMachine.stateMode).toBe(67);
                expect(terminal.println).toHaveBeenCalledWith("FOOD ???.... WELL O.K.");
                expect(terminal.print).toHaveBeenCalledWith("IS IT TO HIT OR DISTRACT");
            });

            it("handles attacks with anything else", function() {
                currentMonster = 1;
                inventory[1] = 6;
                resolveFight();
                expect(gameStateMachine.stateMode).toBe(66);
            });
        });

        describe("gotSwap handles user response to swapping weapons", function() {
            beforeEach(function() {
                inventoryCounter = 2;
                inventory[1] = 1;
                inventory[2] = 2;
                currentWeaponIndex = 1;
            });

            it("accepts '0' to cancel the action", function() {
                inputString = "0";
                gotSwap();
                expect(currentWeaponIndex).toBe(1);
                expect(gameStateMachine.stateMode).toBe(200);
                expect(terminal.println).not.toHaveBeenCalled();
            });

            it("checks that the desired weapon is carried and switches to it", function() {
                inputString = "2";
                gotSwap();
                expect(currentWeaponIndex).toBe(2);
                expect(gameStateMachine.stateMode).toBe(200);
                expect(terminal.println).toHaveBeenCalledWith("O.K. YOU ARE NOW HOLDING A " + equipmentNames[2]);
            });

            it("retains the original weapon if the desired choice is not carried and routes to asking the question again", function() {
                inputString = "3";
                gotSwap();
                expect(currentWeaponIndex).toBe(1);
                expect(gameStateMachine.stateMode).toBe(58);
                expect(terminal.println).toHaveBeenCalledWith("SORRY YOU DONT HAVE THAT ONE");
            })
        });

        describe("swapWeapon asks the user which weapon is desired", function() { //58
            it("asks the question and routes to the response handler", function() {
                swapWeapon();
                expect(terminal.println).toHaveBeenCalledWith("WHICH WEAPON WILL YOU HOLD, NUM OF WEAPON ");
                expect(gameStateMachine.stateMode).toBe(59);
                expect(input).toHaveBeenCalled();
            });
        });

        describe("searching scans the surrounding area and identifies traps and hidden doors", function() {
            var rndSequence = [];
            var rndIndex;
            beforeEach(function() {
                spyOn(window, "rnd").and.callFake(function() { return rndSequence[rndIndex++]; });
                rndIndex = 0;
            });
            it("informs the user that a search is taking place", function() {
                rndSequence = [ 40 ];
                searching();
                expect(terminal.println).toHaveBeenCalledWith("SEARCH.........SEARCH...........SEARCH...........");
                expect(terminal.println).toHaveBeenCalledWith("NO NOT THAT YOU CAN TELL");
            });
            //mapx, mapy, dungeonmap, attributes
            it("identifies any traps or hidden doors within a grid square of the current location", function() {
                rndSequence = [ 0 ];
                mapX = 6;
                mapY = 22;
                searching();
                expect(terminal.println).toHaveBeenCalledWith("SEARCH.........SEARCH...........SEARCH...........");
                expect(terminal.println).toHaveBeenCalledWith("YES THERE IS A TRAP");
                expect(terminal.println).toHaveBeenCalledWith("YES ITS A DOOR");
            });
            it("tests wisdom and intelligence against a random role to see if the search is unsuccessful", function() {
                rndSequence = [ 20 ];
                mapX = 6;
                mapY = 22;
                searching();
                expect(terminal.println).toHaveBeenCalledWith("SEARCH.........SEARCH...........SEARCH...........");
                expect(terminal.println).toHaveBeenCalledWith("NO NOT THAT YOU CAN TELL");
            });
            it("only finds doors and traps if the search is unsuccessful", function() {
                rndSequence = [ 19 ];
                mapX = 6;
                mapY = 22;
                searching();
                expect(terminal.println).toHaveBeenCalledWith("SEARCH.........SEARCH...........SEARCH...........");
                expect(terminal.println).toHaveBeenCalledWith("YES THERE IS A TRAP");
                expect(terminal.println).toHaveBeenCalledWith("YES ITS A DOOR");
            });
        });
    });
});