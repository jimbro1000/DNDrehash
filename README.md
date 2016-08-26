This repository holds the complete code to run this port of Richard Garriott's original DND program, including any dependencies (bad practice I know)

### What is it? ###

* In 1977 R.G. won a bet with his father that he could write a role playing game with the reward being a (then) very expensive Apple computer.  The subsequent code eventually transformed and grew into Akalabeth, the precursor to the Ultima series of games
* This is a literal translation of that basic code into JavaScript, composed as part of a coding competition run by the original author in 2014 
* The original ran through a crude teletype terminal, with the output to paper printout, in the interests of saving some trees, this version uses the screen for output
* Version 0.3

### How do I get set up? ###

* Outside of this respository the only additional requirement to run is a working html 5 compliant browser and somewhere to serve the code from
* The application is launched from the default.html page. Save/Progress data is saved to local cookies if permitted
* jQuery is used to resolve compatibility, version 3.1.0 is included in the repository
* If you wish to run the test you will need to download the standalone jasmine 2 package (currently V2.4.1), this should be located in a folder called jasmine at the root of the package

`Download jasmine-standalone from https://github.com/jasmine/jasmine/releases`

### Contribution guidelines ###

* The program is composed of 100+ short game states, additional states can be added to extend the program
* The state engine only holds a state pointer and an array of valid states. The individual game states are responsible for resolving input and defining state transition
* State transitions are automatic by default but a game state can impose a wait for input
* The tests originally composed for this code have been abandoned and need recomposing to validate behaviours, this is being performed in jasmine. To run the tests view the file SpecRunner.html in the test folder
* The code is intentionally crude in the current version and has significant scope for refinement

### Who do I talk to? ###

* At the moment the code is the sole responsibility of the repo owner but if you wish to contribute please get in touch

### History ###
* **Version 0.1** 15 April 2014 - verbatim translation of the original Microsoft BASIC code
* **Version 0.2** 15 May 2014 - refined and operational code as submitted to Portalarium Inc for entry into the coding contest (no prizes though - mostly due to being untested against iOs and Android I suspect due to how input is handled)
* **Version 0.3** 26 August 2016 - resurrected code, updated to use jQuery 3.1 and refactored for readibility
