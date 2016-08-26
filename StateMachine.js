/**
 * Created by Julian on 25/08/2016.
 */

/***
 * State machine object
 * @constructor
 */
function StateMachine() {
    this.xModel = [];
    this.stateMode = -1;
    this.waitTransition = false;
    this.maxState = 0;
}

/***
 * Add model state to machine
 * @param state
 */
StateMachine.prototype.addState = function(state) {
    this.xModel[this.maxState++] = state;
    this.stateMode = 0;
};

/***
 * Execute state machine step
 * @returns {string}
 */
StateMachine.prototype.modelEngine = function() {
    var result = "";
    // find mode in xModel
    // todo: refine lookup mechanism
    this.waitTransition = false;
    while (!this.waitTransition) {
        var check = true;
        var modeError = false;
        var index = 1;
        var actMode;
        while (check) {
            if (this.xModel[index].id === this.stateMode) {
                actMode = this.xModel[index];
                check = false;
            } else {
                index++;
                check = (index <= this.maxState);
                if (!check) {
                    result = "failed to find mode " + this.stateMode;
                    modeError = true;
                    this.waitTransition = true;
                }
            }
        }
        if (!modeError) {
            result = "processing " + actMode.name;
            actMode.execute();
        }
    }
    return result;
};

/***
 * State machine model state
 * @param id
 * @param name
 * @param process
 * @constructor
 */
function StateModel(id, name, process) {
    this.id = id;
    this.name = name;
    this.process = process;
}

/***
 * Execute machine model state
 */
StateModel.prototype.execute = function() {
    if (this.process) {
        this.process();
    } else {
        throw {
            error: "Missing state process",
            stateId: this.id,
            stateName: this.name
        };
    }
};