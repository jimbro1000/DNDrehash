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
    if (state) {
        if (state.id && state.process) {
            this.xModel[this.maxState++] = state;
            if (this.stateMode === -1) this.stateMode = state.id;
        } else console.println("Not a valid state");
    } else console.println("State is undefined");
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
        var index = 0;
        var actMode;
        while (check) {
            if (this.xModel[index].id === this.stateMode) {
                actMode = this.xModel[index];
                check = false;
            } else {
                index++;
                check = (index < this.maxState);
                if (!check) {
                    result = "failed to find mode " + this.stateMode;
                    modeError = true;
                    this.waitTransition = true;
                }
            }
        }
        if (!modeError) {
            result = actMode.name;
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
 * The process is responsible for determining the input token
 */
StateModel.prototype.execute = function() {
    if (this.process) {
        return this.process();
    } else {
        throw {
            error: "Missing state process",
            stateId: this.id,
            stateName: this.name
        };
    }
};