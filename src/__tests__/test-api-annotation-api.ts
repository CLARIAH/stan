import AnnotationAPI from "../api/AnnotationAPI";
import Annotation from "../model/Annotation";
import { defaultConfig } from "../model/ClientConfig";
const fetch = require("jest-fetch-mock");


const makeDummyAnnotation = () => {
    const dummyAnnotation: Annotation = {
        context: "http://www.w3.org/ns/anno.jsonld",
        id: null,
        type: "Annotation",
        body: "http://example.com",
        target: "http://example.com",
        creator: "jest tester"
    }
    return dummyAnnotation;
}

describe("AnnotationAPI", () => {

    it("should return an annotation with an id and created properties", (done) => {
        const annoNew = makeDummyAnnotation();
        const annoSaved = makeDummyAnnotation();
        annoSaved.id = "some-anno-id";
        annoSaved.created = "2015-02-01T10:13:40Z";
        fetch.mockResponseOnce(JSON.stringify(annoSaved));
        AnnotationAPI.saveAnnotation(annoNew, defaultConfig).then(annotation => {
            console.log(annotation);
            expect(annotation.id).not.toBe(annoSaved.id);
            done();
        })
    })
})