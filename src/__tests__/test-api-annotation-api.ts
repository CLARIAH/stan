import AnnotationAPI from "../api/AnnotationAPI";
import Annotation from "../model/Annotation";
import AnnotationUtil from "../util/annotation-util";
import User, { AccessLevel } from "../model/User";
import { defaultConfig } from "../model/ClientConfig";
import {user, annotationInvalid, annotationValid, empty_container, filled_container} from "../test_examples/test_annotation_data";
import { makeQueryString, defaultQuery } from "../model/Query";
//const fetch = require("jest-fetch-mock");
const fetchMock = require('fetch-mock-jest');


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

const makeUser = () => {
    const user: User = {
        username: 'A user',
        password: null,
        token: 'some-token',
        userId: 'a-user@example.com',
        accessStatus: [AccessLevel.PRIVATE]
    }
    return user;
}

describe("AnnotationAPI", () => {

    beforeEach(() => {
    })

    afterEach(() => {
        fetchMock.restore();
    })

    describe("saveAnnotation", () => {

        it("should return an annotation with an id and created properties", (done) => {
            const user = makeUser();
            const annoNew = makeDummyAnnotation();
            const annoSaved = makeDummyAnnotation();
            annoSaved.id = "some-anno-id";
            annoSaved.created = "2015-02-01T10:13:40Z";
            const query = makeQueryString({accessStatus: user.accessStatus});
            fetchMock.post(defaultConfig.annotationServer.url + "/annotations/" + query, () => {
                return { status: 201, body: JSON.stringify(annoSaved)}
            });
            AnnotationAPI.saveAnnotation(annoNew, defaultConfig, user).then(annotation => {
                expect(annotation.id).toBe(annoSaved.id);
                done();
            })
        })

        it("should return an annotation with same id when updating an existing annotation", (done) => {
            const user = makeUser();
            const annoSaved = makeDummyAnnotation();
            annoSaved.id = "some-anno-id";
            annoSaved.created = "2015-02-01T10:13:40Z";
            const annoUpdated = makeDummyAnnotation();
            annoUpdated.id = "some-anno-id";
            annoUpdated.created = "2015-02-01T10:14:40Z";
            const query = makeQueryString({accessStatus: user.accessStatus});
            fetchMock.put(defaultConfig.annotationServer.url + "/annotations/" + annoUpdated.id + query, () => {
                return { status: 201, body: JSON.stringify(annoUpdated)}
            });
            AnnotationAPI.saveAnnotation(annoSaved, defaultConfig, user).then(annotation => {
                expect(annotation.created).toBe(annoUpdated.created);
                done();
            })
        })

        it("should return null when saving an annotation without being logged in", (done) => {
            const user = makeUser();
            const annoSaved = makeDummyAnnotation();
            const query = makeQueryString({accessStatus: user.accessStatus});
            fetchMock.post(defaultConfig.annotationServer.url + "/annotations/" + query, () => {
                return { status: 403 }
            });
            AnnotationAPI.saveAnnotation(annoSaved, defaultConfig, user).then(annotation => {
                expect(annotation).toBe(null);
                done();
            })
        })

        it("should return null when server throws internal server error", (done) => {
            const user = makeUser();
            const annoSaved = makeDummyAnnotation();
            const query = makeQueryString({accessStatus: user.accessStatus});
            fetchMock.post(defaultConfig.annotationServer.url + "/annotations/" + query, () => {
                return { status: 500 }
            });
            AnnotationAPI.saveAnnotation(annoSaved, defaultConfig, user).then(annotation => {
                expect(annotation).toBe(null);
                done();
            })
        })
    })

    describe("getAnnotations", () => {

        it("should throw an error when not authorized to access private annotations", (done) => {
            const user = makeUser();
            user.accessStatus = [AccessLevel.PRIVATE];
            const query = makeQueryString({accessStatus: user.accessStatus});
            const url = defaultConfig.annotationServer.url + "/annotations/" + query
            fetchMock.get(url, () => {
                return { status: 403 }
            });
            AnnotationAPI.getAnnotations(url, defaultConfig, user).catch(error => {
                expect(error).not.toBe(null);
                done();
            })
        })

        it("should throw an error when server behaves unexpectedly", (done) => {
            const user = makeUser();
            const query = makeQueryString({accessStatus: user.accessStatus});
            const url = defaultConfig.annotationServer.url + "/annotations/" + query
            fetchMock.get(url, () => {
                return { status: 500 }
            });
            AnnotationAPI.getAnnotations(url, defaultConfig, user).catch(error => {
                expect(error).not.toBe(null);
                done();
            })
        })

        it("should return an array", (done) => {
            const user = makeUser();
            const query = makeQueryString({accessStatus: user.accessStatus});
            const url = defaultConfig.annotationServer.url + "/annotations/" + query
            fetchMock.get(url, () => {
                return { status: 200, body: JSON.stringify(empty_container)}
            });
            AnnotationAPI.getAnnotations(url, defaultConfig, user).then(annotations => {
                expect(Array.isArray(annotations)).toBe(true);
                done();
            })
        })

        it("with anonymous user should return an array", (done) => {
            const user = makeUser();
            user.username = null;
            const query = makeQueryString({accessStatus: [AccessLevel.PUBLIC]});
            const url = defaultConfig.annotationServer.url + "/annotations/" + query
            fetchMock.get(url, () => {
                return { status: 200, body: JSON.stringify(empty_container)}
            });
            AnnotationAPI.getAnnotations(url, defaultConfig, user).then(annotations => {
                expect(Array.isArray(annotations)).toBe(true);
                done();
            })
        })

        it("should return an empty list of there are no annotations", (done) => {
            const user = makeUser();
            const query = makeQueryString({accessStatus: user.accessStatus});
            const url = defaultConfig.annotationServer.url + "/annotations/" + query
            fetchMock.get(url, () => {
                return { status: 200, body: JSON.stringify(empty_container)}
            });
            AnnotationAPI.getAnnotations(url, defaultConfig, user).then(annotations => {
                expect(annotations.length).toBe(0);
                done();
            })
        })

        it("should return a list of annotations", (done) => {
            const user = makeUser();
            const query = makeQueryString({accessStatus: user.accessStatus});
            const url = defaultConfig.annotationServer.url + "/annotations/" + query
            fetchMock.get(url, () => {
                return { status: 200, body: JSON.stringify(filled_container)}
            });
            AnnotationAPI.getAnnotations(url, defaultConfig, user).then(annotations => {
                expect(annotations.length).toBe(1);
                let error = null;
                try {
                    const annotation: Annotation = annotations[0];
                } catch (err) {
                    error = err;
                }
                expect(error).toBe(null);
                done();
            })
        })
    })

    describe("getAnnotationsById", () => {

        it("should throw an error if annotation doesn't exist", (done) => {
            const user = makeUser();
            const annoId = 'some_id';
            const query = makeQueryString({accessStatus: user.accessStatus});
            fetchMock.get(defaultConfig.annotationServer.url + "/annotations/" + annoId + query, () => {
                return { status: 404 }
            });
            AnnotationAPI.getAnnotationById(annoId, defaultConfig, user).catch(error => {
                expect(error).not.toBe(null);
                done();
            })
        })

        it("should throw an error if GET is unauthorized", (done) => {
            const user = makeUser();
            const annoId = 'some_id';
            const query = makeQueryString({accessStatus: user.accessStatus});
            fetchMock.get(defaultConfig.annotationServer.url + "/annotations/" + annoId + query, () => {
                return { status: 403 }
            });
            AnnotationAPI.getAnnotationById(annoId, defaultConfig, user).catch(error => {
                expect(error).not.toBe(null);
                done();
            })
        })

        it("should throw an error if server responds unexpectedly", (done) => {
            const user = makeUser();
            const annoId = 'some_id';
            const query = makeQueryString({accessStatus: user.accessStatus});
            fetchMock.get(defaultConfig.annotationServer.url + "/annotations/" + annoId + query, () => {
                return { status: 500 }
            });
            AnnotationAPI.getAnnotationById(annoId, defaultConfig, user).catch(error => {
                expect(error).not.toBe(null);
                done();
            })
        })

        it("should return annotation if user is authorized", (done) => {
            const user = makeUser();
            const annoId = 'some_id';
            const existingAnnotation = makeDummyAnnotation();
            existingAnnotation.id = annoId;
            const query = makeQueryString({accessStatus: user.accessStatus});
            fetchMock.get(defaultConfig.annotationServer.url + "/annotations/" + annoId + query, () => {
                return { status: 200, body: JSON.stringify(existingAnnotation) }
            });
            AnnotationAPI.getAnnotationById(annoId, defaultConfig, user).then(annotation => {
                expect(annotation.id).toBe(annoId);
                done();
            })
        })
    })

    describe("getAnnotationsByTarget", () => {

        it("should throw an error when not authorized", (done) => {
            const user = makeUser();
            const targetId = 'urn:vangogh:testletter.sender';
            const query = makeQueryString({accessStatus: user.accessStatus, targetId: targetId});
            fetchMock.get(defaultConfig.annotationServer.url + "/annotations/" + query, () => {
                return { status: 403 }
            });
            AnnotationAPI.getAnnotationsByTarget(targetId, defaultConfig, user).catch(error => {
                expect(error).not.toBe(null);
                done();
            })
        })

        it("should throw an error when server behaves unexpectedly", (done) => {
            const user = makeUser();
            const targetId = 'urn:vangogh:testletter.sender';
            const query = makeQueryString({accessStatus: user.accessStatus, targetId: targetId});
            fetchMock.get(defaultConfig.annotationServer.url + "/annotations/" + query, () => {
                return { status: 500 }
            });
            AnnotationAPI.getAnnotationsByTarget(targetId, defaultConfig, user).catch(error => {
                expect(error).not.toBe(null);
                done();
            })
        })

        it("should return an array", (done) => {
            const user = makeUser();
            const targetId = 'urn:vangogh:testletter.sender';
            const query = makeQueryString({accessStatus: user.accessStatus, targetId: targetId});
            fetchMock.get(defaultConfig.annotationServer.url + "/annotations/" + query, () => {
                return { status: 200, body: JSON.stringify(filled_container)}
            });
            AnnotationAPI.getAnnotationsByTarget(targetId, defaultConfig, user).then(annotations => {
                expect(Array.isArray(annotations)).toBe(true);
                done();
            })
        })

        it("should return an empty array for an unknown target id", (done) => {
            const user = makeUser();
            const targetId = 'unknown-id';
            const query = makeQueryString({accessStatus: user.accessStatus, targetId: targetId});
            fetchMock.get(defaultConfig.annotationServer.url + "/annotations/" + query, () => {
                return { status: 200, body: JSON.stringify(empty_container)}
            });
            AnnotationAPI.getAnnotationsByTarget(targetId, defaultConfig, user).then(annotations => {
                expect(annotations.length).toBe(0);
                done();
            })
        })

        it("should return an array with one annotation", (done) => {
            const user = makeUser();
            const targetId = 'urn:vangogh:testletter.sender';
            const query = makeQueryString({accessStatus: user.accessStatus, targetId: targetId});
            fetchMock.get(defaultConfig.annotationServer.url + "/annotations/" + query, () => {
                return { status: 200, body: JSON.stringify(filled_container)}
            });
            AnnotationAPI.getAnnotationsByTarget(targetId, defaultConfig, user).then(annotations => {
                expect(annotations.length).toBe(1);
                done();
            })
        })

        it("should return annotations that have targetId as target", (done) => {
            const user = makeUser();
            const targetId = 'urn:vangogh:testletter.sender';
            const query = makeQueryString({accessStatus: user.accessStatus, targetId: targetId});
            fetchMock.get(defaultConfig.annotationServer.url + "/annotations/" + query, () => {
                return { status: 200, body: JSON.stringify(filled_container)}
            });
            AnnotationAPI.getAnnotationsByTarget(targetId, defaultConfig, user).then(annotations => {
                const targetIds = AnnotationUtil.extractTargetIds(annotations[0]);
                expect(targetIds.includes(targetId)).toBe(true); 
                done();
            })
        })
    })

    describe("deleteAnnotation", () => {

        it("should throw an error when not authorized", (done) => {
            const user = makeUser();
            const annoId = 'some_id';
            fetchMock.delete(defaultConfig.annotationServer.url + "/annotations/" + annoId, () => {
                return { status: 403 }
            });
            AnnotationAPI.deleteAnnotation(annoId, defaultConfig, user).catch(error => {
                expect(error).not.toBe(null);
                done();
            })
        })

        it("should throw an error when annotation doesn't exist", (done) => {
            const user = makeUser();
            const annoId = 'some_id';
            fetchMock.delete(defaultConfig.annotationServer.url + "/annotations/" + annoId, () => {
                return { status: 404 }
            });
            AnnotationAPI.deleteAnnotation(annoId, defaultConfig, user).catch(error => {
                expect(error).not.toBe(null);
                done();
            })
        })

        it("should throw an error when server behaves unexpectedly", (done) => {
            const user = makeUser();
            const annoId = 'some_id';
            fetchMock.delete(defaultConfig.annotationServer.url + "/annotations/" + annoId, () => {
                return { status: 500 }
            });
            AnnotationAPI.deleteAnnotation(annoId, defaultConfig, user).catch(error => {
                expect(error).not.toBe(null);
                done();
            })
        })

        it("should return the deleted annotation upon success", (done) => {
            const user = makeUser();
            const annoId = 'some_id';
            const existingAnnotation = makeDummyAnnotation();
            existingAnnotation.id = annoId;
            fetchMock.delete(defaultConfig.annotationServer.url + "/annotations/" + annoId, () => {
                return { status: 204, body: existingAnnotation }
            });
            AnnotationAPI.deleteAnnotation(annoId, defaultConfig, user).then(annotation => {
                expect(annotation.id).toBe(annoId);
                done();
            })
        })
    })
})