import AnnotationUtil from "../util/annotation-util";

describe("AnnotationUtil", () => {

    describe("listMotivations", () => {

        it("should return an array", (done) => {
            const motivations = AnnotationUtil.listMotivations();
            expect(Array.isArray(motivations)).toBe(true);
            done();
        })

        it("should return an array of strings, including 'assessing'", (done) => {
            const motivations = AnnotationUtil.listMotivations();
            expect(motivations.includes("assessing")).toBe(true);
            done();
        })
    })
})