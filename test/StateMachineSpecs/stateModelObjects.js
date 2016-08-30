/**
 * Created by Julian on 27/08/2016.
 */
describe("State Machine Model", function() {
	it("Contains three properties on creation", function() {
		var obj = new StateModel("id", "name", function() {
			return "process";
		});
		expect(obj.id === "id").toBe(true);
		expect(obj.name === "name").toBe(true);
		expect(obj.process() === "process").toBe(true);
	});

	it("Executes the defined process", function() {
		var obj = new StateModel("id", "name", function() {
			return "process";
		});
		var result = obj.execute();
		expect(result === "process").toBe(true);
	});
});

describe("State Machine", function() {
	var testObj;

	afterEach(function() {
		testObj = null;
	});

	describe("Constructor", function() {
		beforeEach(function() {
			testObj = new StateMachine();
		});

		it("Contains four properties on creation", function() {
			expect(testObj.xModel).not.toBeUndefined();
			expect(testObj.stateMode).not.toBeUndefined();
			expect(testObj.waitTransition).not.toBeUndefined();
			expect(testObj.maxState).not.toBeUndefined();
		});

		it("Has an empty model set", function() {
			expect(testObj.xModel.length === 0).toBe(true);
			expect(testObj.maxState === 0).toBe(true);
			expect(testObj.stateMode === -1).toBe(true);
		});
	});

	describe("Building Model Set", function() {
		beforeEach(function() {
			testObj = new StateMachine();
		});

		it("Stores models in the model set", function() {
			var modelObj = new StateModel(1, "test", function() { return "process"; });
			testObj.addState(modelObj);
			expect(testObj.xModel.length === 1).toBe(true);
			expect(testObj.stateMode === modelObj.id).toBe(true);
		});

		it("Assumes the first added model to be the start", function() {
			var modelObj = new StateModel(1, "test", function() { return "process"; });
			testObj.addState(modelObj);
			modelObj = new StateModel(2, "test 2", function() { return "process 2"; });
			testObj.addState(modelObj);
			expect(testObj.xModel.length === 2).toBe(true);
			expect(testObj.stateMode === 1).toBe(true);
		});
	});

	describe("Executing Models", function() {
		var initialState;
		var waitState;

		beforeEach(function() {
			initialState = new StateModel(1, "test", function() {
				testObj.stateMode = 2;
			});
			testObj = new StateMachine();
			testObj.addState(initialState);
			waitState = new StateModel(2, "test 2", function() {
				testObj.waitTransition = true;
			});
			testObj.addState(waitState);
			var modelObj = new StateModel(3, "test 3", function() {
				testObj.stateMode = 4;
			});
			testObj.addState(modelObj);
		});

		it("Executes the current state model", function() {
			spyOn(initialState, 'process').and.callThrough();
			testObj.modelEngine();
			expect(initialState.process).toHaveBeenCalled();
			expect(testObj.stateMode === 2).toBe(true);
		});

		it("Executes states until a wait transition is set", function() {
			spyOn(waitState, 'process').and.callThrough();
			testObj.modelEngine();
			expect(waitState.process).toHaveBeenCalled();
			expect(testObj.waitTransition).toBe(true);
		});

		it("Returns the name of the last model executed", function() {
			var result = testObj.modelEngine();
			expect(result === "test 2").toBe(true);
		});

		it("Returns an error message if the state model set is broken", function() {
			testObj.stateMode = 3;
			var result = testObj.modelEngine();
			expect(result === "failed to find mode 4").toBe(true);
		});
	});
});