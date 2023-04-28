import StateMachine from "../../StateMachine";
import StateModel from "../../StateModel";

describe("State Machine", () => {
    let testObj;

    afterEach(() => {
        testObj = null;
    });

    describe("Constructor", () => {
        beforeEach(() => {
            testObj = new StateMachine();
        });

        it("Contains four properties on creation", () => {
            expect(testObj.xModel).not.toBeUndefined();
            expect(testObj.stateMode).not.toBeUndefined();
            expect(testObj.waitTransition).not.toBeUndefined();
            expect(testObj.maxState).not.toBeUndefined();
        });

        it("Has an empty model set", () => {
            expect(testObj.xModel.length === 0).toBe(true);
            expect(testObj.maxState === 0).toBe(true);
            expect(testObj.stateMode === -1).toBe(true);
        });
    });

    describe("Building Model Set", () => {
        beforeEach(() => {
            testObj = new StateMachine();
        });

        it("Stores models in the model set", () => {
            let modelObj = new StateModel(1, "test", () => { return "process"; });
            testObj.addState(modelObj);
            expect(testObj.xModel.length === 1).toBe(true);
            expect(testObj.stateMode === modelObj.id).toBe(true);
        });

        it("Assumes the first added model to be the start", () => {
            let modelObj = new StateModel(1, "test", () => { return "process"; });
            testObj.addState(modelObj);
            modelObj = new StateModel(2, "test 2", () => { return "process 2"; });
            testObj.addState(modelObj);
            expect(testObj.xModel.length === 2).toBe(true);
            expect(testObj.stateMode === 1).toBe(true);
        });
    });

    describe("Executing Models", () => {
        let initialState;
        let waitState;

        beforeEach(() => {
            initialState = new StateModel(1, "test", () => {
                testObj.stateMode = 2;
            });
            testObj = new StateMachine();
            testObj.addState(initialState);
            waitState = new StateModel(2, "test 2", () => {
                testObj.waitTransition = true;
            });
            testObj.addState(waitState);
            let modelObj = new StateModel(3, "test 3", () => {
                testObj.stateMode = 4;
            });
            testObj.addState(modelObj);
        });

        it("Executes the current state model", () => {
            spyOn(initialState, 'process').and.callThrough();
            testObj.modelEngine();
            expect(initialState.process).toHaveBeenCalled();
            expect(testObj.stateMode === 2).toBe(true);
        });

        it("Executes states until a wait transition is set", () => {
            spyOn(waitState, 'process').and.callThrough();
            testObj.modelEngine();
            expect(waitState.process).toHaveBeenCalled();
            expect(testObj.waitTransition).toBe(true);
        });

        it("Returns the name of the last model executed", () => {
            let result = testObj.modelEngine();
            expect(result === "test 2").toBe(true);
        });

        it("Returns an error message if the state model set is broken", () => {
            testObj.stateMode = 3;
            let result = testObj.modelEngine();
            expect(result === "failed to find mode 4").toBe(true);
        });
    });
});