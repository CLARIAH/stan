import Annotation from "../model/Annotation";
import API from "./API";
import User from "../model/User";
import { Query } from "../model/Query";
import { ClientConfig } from "../model/ClientConfig";
import { makeQueryString } from "../model/Query";

export default class AnnotationAPI extends API {

    static async saveAnnotation(annotation: Annotation, config: ClientConfig, user: User) {
        const query = makeQueryString({accessStatus: user.accessStatus});
        let endpoint = (annotation.id !== null) ? "/annotations/" + annotation.id : "/annotations/";
        const url = config.annotationServer.url + endpoint + query;
        let method = (annotation.id) ? "PUT" : "POST"; // if annotation already has id, save means update
        const options = {
            method: method,
            body: JSON.stringify(annotation),
            headers: {"Content-Type": "application/json"}
        }
        const response = await this.makeRequest(url, options, user);
        if (response.status === 200 || response.status === 201) {
            const annotation = await response.json();
            return annotation;
        } else if (response.status === 403 ) {
            // not authorized to update annotation or user token has expired, need to login 
            return null;
        } else {
            return null;
        }
    }

    static async getAnnotations(url: string, config: ClientConfig, user: User) {
        // should always return an array
        const options = {
            method: "GET",
            headers: {"Content-Type": "application/json"}
        };
        const response = await this.makeRequest(url, options, user);
        if (response.status === 200) {
            const annotation_container = await response.json();
            if (annotation_container['total'] > 0) {
                return annotation_container['first']['items'];
            } else {
                let annotations: Array<Annotation> = [];
                return annotations;
            }
        } else if (response.status === 403) {
            throw Error("Token expired");
        } else {
            throw Error("Server responded unexpectedly");
        }
    }

    static async getAnnotationById(annotationId: string, config: ClientConfig, user: User) {
        const query = makeQueryString({accessStatus: user.accessStatus});
        const url = config.annotationServer.url + "/annotations/" + annotationId + query;
        const options = {
            method: "GET",
        }
        const response = await this.makeRequest(url, options, user);
        if (response.status === 200) {
            return response.json();
        } else if (response.status === 404) {
            throw Error("Annotation doesn't exist with id: " + annotationId);
        } else if (response.status === 403) {
            // token expired or no permission to see id
            throw Error("Not authorized to GET annotation with id: " + annotationId);
        } else {
            // some other (server) error
            throw Error("Server responded unexpectedly");
        }
    }

    static async getAnnotationsByTarget(targetId: string, config: ClientConfig, user: User) {
        const query = makeQueryString({accessStatus: user.accessStatus, targetId: targetId});
        const url = config.annotationServer.url + "/annotations/" + query;
        return this.getAnnotations(url, config, user);
    }

    static async deleteAnnotation(annotationId: string, config: ClientConfig, user: User) {
        const url = config.annotationServer.url + "/annotations/" + annotationId;
        const options = {
            method: "DELETE",
        }
        const response = await this.makeRequest(url, options, user);
        if (response.status === 204) {
            // delete successful, return the deleted annotation
            return response.json()
        } else if (response.status === 403) {
            throw Error("Not authorized to DELETE annotation with id: " + annotationId);
        } else if (response.status === 404) {
            throw Error("Annotation doesn't exist with id: " + annotationId);
        } else {
            throw Error("Server responded unexpectedly");
        }
    }
}