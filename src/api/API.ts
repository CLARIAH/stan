import User from "../model/User";

export default class API {

    constructor() {
        // do nothing
    }

    static addAuthorization (user: User) {
        let authorizationString = "";
        if (user.token) {
            authorizationString = user.token+":unused";
        } else {
            authorizationString = user.username+":"+user.password;
        }
        return "Basic " + btoa(authorizationString)
    }

    static async makeRequest(url: string, options: RequestInit, user: User) {
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('Content-Type', 'application/json');
        if (user.username) {
            requestHeaders.set('Authorization', this.addAuthorization(user));
        }
        options.cache = "no-cache";
        options.mode = "cors";
        options.headers = requestHeaders;
        const response = await fetch(url, options);
        return response;
    }
}
