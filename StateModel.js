/**
 * State machine model state.
 *
 * @param id
 * @param name
 * @param process
 * @constructor
 */
class StateModel {
    #id;
    #name;
    #process;

    constructor(id, name, process) {
        this.#id = id;
        this.#name = name;
        this.#process = process;
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get process() {
        return this.#process;
    }

    /**
     * Execute machine model state
     * The process is responsible for determining the input token
     */
    execute() {
        if (this.#process) {
            return this.#process();
        } else {
            throw {
                error: "Missing state process",
                stateId: this.#id,
                stateName: this.#name
            };
        }
    }
}

module.exports = StateModel;
