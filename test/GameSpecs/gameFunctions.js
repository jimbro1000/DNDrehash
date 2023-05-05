/**
 * Created by Julian on 27/08/2016.
 */
describe("Game Functions", function() {
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