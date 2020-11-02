import UserAPI from "../api/UserAPI";
import User, { AccessLevel } from "../model/User";
import { defaultConfig } from "../model/ClientConfig";
import { user } from "../test_examples/test_annotation_data";
//const fetch = require("jest-fetch-mock");
const fetchMock = require('fetch-mock-jest');

const makeUser = () => {
    const newUser: User = {
        username: user.username,
        password: user.password,
        token: null,
        userId: null,
        accessStatus: [AccessLevel.PRIVATE]
    }
    return newUser;
}

const registerUser = (user: User) => {
    const registeredUser = {
        user: {
            username: user.username,
            token: 'some-token'
        }
    }
    return registeredUser;
}

describe("UserAPI", () => {

    describe("handling user request", () => {

        afterEach(() => {
            fetchMock.restore();
        })

        describe("registerUser", () => {

            it("should return a user object with a token if successful", (done) => {

                const newUser = makeUser();
                const registeredUser = registerUser(newUser);
                fetchMock.post(defaultConfig.annotationServer.url + "/users", () => {
                    return { status: 201, body: JSON.stringify(registeredUser)}
                });
                UserAPI.registerUser(newUser, defaultConfig).then(user => {
                    expect(user.token).toBe(registeredUser.user.token);
                    done();
                })
            })

            it("should throw an error if user already exists", (done) => {
                const newUser = makeUser();
                fetchMock.post(defaultConfig.annotationServer.url + "/users", () => {
                    return { status: 403, body: null}
                });
                UserAPI.registerUser(newUser, defaultConfig).catch(error => {
                    expect(error.message).toBe('Username is already in use');
                    done();
                })
            })

            it("should throw an error if something unexpected happens", (done) => {
                const newUser = makeUser();
                fetchMock.post(defaultConfig.annotationServer.url + "/users", () => {
                    return { status: 500, body: null}
                });
                UserAPI.registerUser(newUser, defaultConfig).catch(error => {
                    expect(error.message).toBe('Unexpected server response');
                    done();
                })
            })
        })

        describe("loginUser", () => {
            //
            it("should return user with token if successful", (done) => {
                const existingUser = makeUser();
                const registeredUser = registerUser(existingUser);
                fetchMock.post(defaultConfig.annotationServer.url + "/login", () => {
                    return { status: 200, body: JSON.stringify(registeredUser)}
                });
                UserAPI.loginUser(existingUser, defaultConfig).then(user => {
                    expect(user.token).toBe(registeredUser.user.token);
                    done();
                })
            })

            it("should throw an error if user does not exist", (done) => {
                const existingUser = makeUser();
                const registeredUser = registerUser(existingUser);
                fetchMock.post(defaultConfig.annotationServer.url + "/login", () => {
                    return { status: 404, body: JSON.stringify(registeredUser)}
                });
                UserAPI.loginUser(existingUser, defaultConfig).catch(error => {
                    expect(error.message).toBe('User does not exist');
                    done();
                })
            })

            it("should throw an error if invalid userdetails are submitted", (done) => {
                const existingUser = makeUser();
                fetchMock.post(defaultConfig.annotationServer.url + "/login", () => {
                    return { status: 400, body: null }
                });
                UserAPI.loginUser(existingUser, defaultConfig).catch(error => {
                    expect(error.message).toBe('Invalid user');
                    done();
                })
            })

            it("should throw an error if something unexpected happens", (done) => {
                const existingUser = makeUser();
                fetchMock.post(defaultConfig.annotationServer.url + "/login", () => {
                    return { status: 500, body: null }
                });
                UserAPI.loginUser(existingUser, defaultConfig).catch(error => {
                    expect(error.message).toBe('Unexpected server response');
                    done();
                })
            })
        })

        describe("logoutUser", () => {

            it("should return success if logged out user tries to logout", (done) => {
                const existingUser = makeUser();
                fetchMock.get(defaultConfig.annotationServer.url + "/logout", () => {
                    return { status: 200, loggedIn: false}
                });
                UserAPI.logoutUser(existingUser, defaultConfig).then(status => {
                    expect(status.loggedIn).toBe(false);
                    done();
                })
            })

            it("should return success if logged in user is logged out", (done) => {
                const existingUser = makeUser();
                const registeredUser = registerUser(existingUser);
                existingUser.token = registeredUser.user.token;
                fetchMock.get(defaultConfig.annotationServer.url + "/logout", () => {
                    return { status: 200, loggedIn: false}
                });
                UserAPI.logoutUser(existingUser, defaultConfig).then(status => {
                    expect(status.loggedIn).toBe(false);
                    done();
                })
            })

            it("should return success if user token is expired", (done) => {
                const existingUser = makeUser();
                const registeredUser = registerUser(existingUser);
                existingUser.token = registeredUser.user.token;
                fetchMock.get(defaultConfig.annotationServer.url + "/logout", () => {
                    return { status: 403}
                });
                UserAPI.logoutUser(existingUser, defaultConfig).then(status => {
                    expect(status.loggedIn).toBe(false);
                    done();
                })
            })

            it("should return failure if server sends unexpected response", (done) => {
                const existingUser = makeUser();
                const registeredUser = registerUser(existingUser);
                existingUser.token = registeredUser.user.token;
                fetchMock.get(defaultConfig.annotationServer.url + "/logout", () => {
                    return { status: 500}
                });
                UserAPI.logoutUser(existingUser, defaultConfig).then(status => {
                    expect(status.loggedIn).toBe(true);
                    done();
                })
            })
        })

        describe("deleteUser", () => {
            // TO DO

            it("should return empty user if successful", (done) => {

                const existingUser = makeUser();
                const registeredUser = registerUser(existingUser);
                existingUser.token = registeredUser.user.token;
                fetchMock.delete(defaultConfig.annotationServer.url + "/users", () => {
                    return { status: 204}
                });
                UserAPI.deleteUser(existingUser, defaultConfig).then(status => {
                    expect(status.user).toBe(null);
                    done();
                })
            });

            it("should log out user if successful", (done) => {

                const existingUser = makeUser();
                const registeredUser = registerUser(existingUser);
                existingUser.token = registeredUser.user.token;
                fetchMock.delete(defaultConfig.annotationServer.url + "/users", () => {
                    return { status: 204}
                });
                UserAPI.deleteUser(existingUser, defaultConfig).then(status => {
                    expect(status.loggedIn).toBe(false);
                    done();
                })
            });

            it("should return delete message if successful", (done) => {

                const existingUser = makeUser();
                const registeredUser = registerUser(existingUser);
                existingUser.token = registeredUser.user.token;
                fetchMock.delete(defaultConfig.annotationServer.url + "/users", () => {
                    return { status: 204}
                });
                UserAPI.deleteUser(existingUser, defaultConfig).then(status => {
                    expect(status.message).toBe('User deleted');
                    done();
                })
            });

            it("should throw an error if user token is expired", (done) => {

                const existingUser = makeUser();
                const registeredUser = registerUser(existingUser);
                existingUser.token = registeredUser.user.token;
                fetchMock.delete(defaultConfig.annotationServer.url + "/users", () => {
                    return { status: 403}
                });
                UserAPI.deleteUser(existingUser, defaultConfig).catch(error => {
                    expect(error).not.toBe(null);
                    done();
                })
            });

            it("should throw an error if server does something unexpected", (done) => {

                const existingUser = makeUser();
                const registeredUser = registerUser(existingUser);
                existingUser.token = registeredUser.user.token;
                fetchMock.delete(defaultConfig.annotationServer.url + "/users", () => {
                    return { status: 500}
                });
                UserAPI.deleteUser(existingUser, defaultConfig).catch(error => {
                    expect(error).not.toBe(null);
                    done();
                })
            });

            it("should throw an error if user is not logged in", (done) => {

                const existingUser = makeUser();
                fetchMock.delete(defaultConfig.annotationServer.url + "/users", () => {
                    return { status: 403}
                });
                UserAPI.deleteUser(existingUser, defaultConfig).catch(error => {
                    expect(error).not.toBe(null);
                    done();
                })
            });

        })
    })
})