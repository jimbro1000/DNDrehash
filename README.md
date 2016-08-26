This repository holds the complete code to run this port of Richard Garriott's original DND program, including any dependencies (bad practice I know)

### What is it? ###

* In 1977 R.G. won a bet with his father that he could write a Dungeons and Dragons game with the reward being a (then) very expensive Apple computer.  The subsequent code eventually transformed and grew into the Ultima series of games.
* This is a literal translation of that basic code into JavaScript, composed as part of a coding competition run by the original author in 2014
* Version 0.3

### How do I get set up? ###

* Outside of this respository the only additional requirement is a working html 5 compliant browser and somewhere to serve the code from
* The application is launched from the default.html page. Save/Progress data is saved to local cookies if permitted
* jQuery is used to resolve compatibility, version 3.1.0 is included in the repo.

### Contribution guidelines ###

* The program is composed of 100+ short game states, additional states can be added to extend the program
* The state engine only holds a state pointer and an array of valid states. The individual game states are responsible for resolving input and defining state transition.
* State transitions are automatic by default but a game state can impose a wait for input
* The tests originally composed for this code have been abandoned and need recomposing to validate behaviours
* The code is intentionally crude in the current version and has significant scope for refinement

### Who do I talk to? ###

* At the moment the code is the sole responsibility of the repo owner but if you wish to contribute please get in touch