/**
 * Created by Julian on 25/08/2016.
 */

/**
 * State machine object.
 *
 * @constructor
 */
class StateMachine {
    #xModel;
    #stateMode;
    #waitTransition;
    #maxState;

    constructor() {
        this.#xModel = [];
        this.#stateMode = -1;
        this.#waitTransition = false;
        this.#maxState = 0;
    }

    /**
     * Add state model to machine.
     *
     * @param state
     */
    addState(state) {
        if (state) {
            if (state.id && state.process) {
                this.#xModel[this.#maxState++] = state;
                if (this.stateMode === -1) this.stateMode = state.id;
            } else console.println("Not a valid state");
        } else console.println("State is undefined");
    }

    /**
     * Execute state machine step.
     *
     * @returns {string}
     */
    modelEngine() {
        let result = "";
        // todo: refine lookup mechanism
        this.#waitTransition = false;
        while (!this.#waitTransition) {
            let check = true;
            let modeError = false;
            let index = 0;
            let actMode = null;
            while (check) {
                if (this.#xModel[index].id === this.#stateMode) {
                    actMode = this.#xModel[index];
                    check = false;
                } else {
                    index++;
                    check = (index < this.#maxState);
                    if (!check) {
                        result = "failed to find mode " + this.#stateMode;
                        modeError = true;
                        this.#waitTransition = true;
                    }
                }
            }
            if (!modeError && !actMode) {
                result = actMode.name;
                actMode.execute();
            }
        }
        return result;
    }
}

module.exports = StateMachine;
