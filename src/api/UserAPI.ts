import API from "./API";
import User from "../model/User";
import { ClientConfig } from "../model/ClientConfig";

export default class UserAPI extends API {

    static async registerUser(user: User, clientConfig: ClientConfig) {
        const url = clientConfig.annotationServer.url + "/users";
        const method = "POST";
        const options = {
            method: method,
            body: JSON.stringify(user),
            headers: {"Content-Type": "application/json"}
        };
        const response = await this.makeRequest(url, options, user);
        if (response.status === 201) {
            const registration = await response.json();
            const newUser: User = {
                username: registration.user.username,
                password: user.password,
                token: registration.user.token,
                userId: registration.user.username
            }
            return newUser;
        } else if (response.status === 403) {
            throw Error('Username is already in use');
        } else {
            throw Error('Unexpected server response');
        }
    }

    static async loginUser(user: User, clientConfig: ClientConfig) {
        const url = clientConfig.annotationServer.url + "/login";
        const method = "POST";
        const options = {
            method: method,
            body: JSON.stringify(user),
            headers: {"Content-Type": "application/json"}
        };
        const response = await this.makeRequest(url, options, user);
        if (response.status === 200) {
            const registration = await response.json();
            const newUser: User = {
                username: registration.user.username,
                password: user.password,
                token: registration.user.token,
                userId: registration.user.username
            }
            return newUser;
        } else if (response.status === 400) {
            throw Error('Invalid user');
        } else if (response.status === 404) {
            throw Error('User does not exist');
        } else {
            throw Error('Unexpected server response');
        }
    }

    static async logoutUser(user: User, clientConfig: ClientConfig) {
        if (!user.token) {
            return {loggedIn: false};
        }
        const url = clientConfig.annotationServer.url + "/logout";
        const method = "GET";
        const options = {
            method: method,
            headers: {"Content-Type": "application/json"}
        };
        const response = await this.makeRequest(url, options, user);
        if (response.status === 200) {
            const registration = response.json();
            return {loggedIn: false};
        } else if (response.status === 403) {
            // user token refused, probably expired
            return {loggedIn: false};
        } else {
            // something went wrong server-side, so token might still be active
            return {loggedIn: true}
        }
    }

    static async deleteUser(user: User, clientConfig: ClientConfig) {
        if (!user.token) {
            throw Error('User is not logged in');
        }
        const url = clientConfig.annotationServer.url + "/users";
        const method = "DELETE";
        const options = {
            method: method,
        };
        const response = await this.makeRequest(url, options, user);
        if (response.status === 204) {
            return {loggedIn: false, user: null, message: 'User deleted'}
        } else if (response.status === 403) {
            // user token refused, probably expired
            throw Error('Token expired');
        } else {
            // something went wrong server-side, so token might still be active
            throw Error('Server error');
        }
    }
}
