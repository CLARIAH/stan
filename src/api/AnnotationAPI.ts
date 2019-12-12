import Annotation from "../model/Annotation";
import { ClientConfig } from "../model/ClientConfig";

export default class AnnotationAPI {

    static async saveAnnotation(annotation: Annotation, config: ClientConfig) {
        let method = (annotation.id) ? "PUT" : "POST";
        const url = config.annotationServer.url + "/annotations/";
        const response = await fetch(url, {
            method: method,
            body: JSON.stringify(annotation),
            headers: {"Content-Type": "application/json"}
        });
        if (response.status === 200 || response.status === 201) {
            const annotation = await response.json();
            return annotation;
        } else {
            return null;
        }
    }
}