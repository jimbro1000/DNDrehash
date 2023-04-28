import StateModel from "../../StateModel"
/**
 * Created by Julian on 27/08/2016.
 */
describe("State Machine Model", function() {
    it("Contains three properties on creation", function() {
        let obj = new StateModel(1, "name", () => {
            return "process";
        });
        expect(obj.id).toBe(1);
        expect(obj.name).toBe("name");
        const process = obj.process
        expect(typeof process).toBe("function");
        expect(process()).toBe("process");
    });

    it("Executes the defined process", function() {
        let obj = new StateModel("id", "name", function() {
            return "process";
        });
        expect(obj.execute()).toBe("process");
    });
});
