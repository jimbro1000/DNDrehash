# DND #

This repository holds the complete code to build and run this port of Richard Garriott's 
original DND program.

### What is it? ###

* In 1977 R.G. won a bet with his father that he could write a role playing game with the reward being a (then) very expensive Apple computer.  The subsequent code eventually transformed and grew into Akalabeth, the precursor to the Ultima series of games
* This is a literal translation of that bet winning basic code into JavaScript, composed as part of a coding competition run by the original author in 2014 
* The original ran through a crude teletype terminal, with the output to paper printout, in the interests of saving some trees, this version uses the screen for output
* Currently, at version 0.4

### How do I get set up? ###

Outside of this repository the only additional requirement to run is a working html 5 
compliant browser and somewhere to serve the code from.

The application is launched from the default.html page. Save/Progress data is saved to 
local cookies if permitted. Node and NPM are used to manage dependencies, minimum version 
of Node 14 (now out of support).

The build process uses webpack to package the entire set of javascript dependencies into a
compressed form (currently 130KB).

A set of automated tests exist, and can be exercised using the NPM test script,
or by using the Jest CLI.

### Contribution guidelines ###

* The program is composed of 100+ short game states, additional states can be added to 
extend the program
* The state engine only holds a state pointer and an array of valid states. The individual 
game states are responsible for resolving input and defining state transition
* State transitions are automatic by default but a game state can impose a wait for input
* The tests originally composed for this code have been abandoned and need recomposing to 
validate behaviours, to test use the test script in NPM
* The code is intentionally crude and has peculiarities as a hang-over from being written in
an early version of BASIC (Altair Basic?). In the current version and has significant scope 
for refinement. The original code was provided as a scan of a printout - not
the most accurate digital format, coupled with a lot of bugs and typos. I've
done my best to straighten the whole thing out but bits of the code are still
very opaque
* Remember that Richard Garriott has retained copyright to the original code 
and all derived code. No explicit license was given when the competition
took place and the source code was freely published on the open internet at
the time - interpret that as you will

### Plans for version 0.5.0 ###

* Resolve any missing or broken code in the original source
* Migrate functionality to enable hosting as a Node Express app
* Convert user input to sockets instead of the clunky original input mechanism
* Streamline spell and inventory system to reduce code duplication

### Plans for version 1.0 and beyond ###

* Enable a full game experience (retaining the console based ASCII gameplay)
* Extend editing of maps
* Introduce meta game state for storytelling

### Who do I talk to? ###

At the moment the code is the sole responsibility of the repo owner but if you wish to 
contribute please get in touch

### History ###
* **Version 0.1** 15 April 2014 - verbatim translation of the original Altair/Microsoft BASIC code
* **Version 0.2** 15 May 2014 - refined and operational code as submitted to Portalarium Inc for entry into the coding contest (no prizes though - mostly due to being untested against iOs and Android I suspect due to how input is handled)
* **Version 0.3** 26 August 2016 - resurrected code, updated to use jQuery 3.1 and refactored for readability
* **Version 0.4.0** 30 April 2023 - re-resurrected code, migrated to node for build and test
