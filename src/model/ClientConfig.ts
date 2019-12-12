import { Motivation } from "./Annotation";

export enum configProperties {
    ANNOTATIONSERVER = "annotationServer",
    EDITOPTIONS = "editOptions",
    MOTIVATIONCONFIG = "motivationConfig",
    HIERARCHICALRELATIONS = "hierarchicalRelations",
    REPRESENTATIONRELATIONS = "representationRelations",
}

export interface HierarchicalRelation {
    includes: string,
    isIncludedIn?: string
}

export interface ClassificationVocabulary {
    name: string,
    url: string
}

export interface LinkingAPI {
    name: string,
    url: string
}

export interface MotivationConfig {
    motivation: Motivation,
    config: any
}

export interface AnnotationServer {
    url: string
}

/*
export class AnnotationServer {

    constructor(public url: string) {
        this.url = url;
    }
}

export class EditOption {

    constructor(public targetType: string, public motivations: Array<Motivation>) {
        this.targetType = targetType;
        this.motivations = motivations;
    }
}

export class EditOptions {

    constructor(public editOptions: Array<EditOption>) {
        this.editOptions = editOptions;
    }
}

export class ClassificationConfig {

    public motivation: Motivation = Motivation.CLASSIFYING;

    constructor(public vocabularies: Array<ClassificationVocabulary>) {
        this.vocabularies = vocabularies;
    }
}

export class LinkingConfig {

    public motivation: Motivation = Motivation.LINKING;

    constructor(public linkingApis: Array<LinkingAPI>) {
        this.linkingApis = linkingApis;
    }
}

export class MotivationConfigList {

    constructor(public motivationConfigList)
}

/*
export default class ClientConfig {
    
    constructor(public annotationServer: AnnotationServer) {
        this.annotationServer = annotationServer;
    }
}
*/

export interface ClientConfig {
    annotationServer: AnnotationServer,
    editOptions: {
        [targetType: string]: {
            "motivations": Array<Motivation>
        }
    },
    motivationConfig: {
        [motivation: string]: any,
        classifying?: {
            vocabularies: Array<ClassificationVocabulary>
        },
        linking?: {
            apis: Array<LinkingAPI>
        }
    },
    hierarchicalRelations: Array<HierarchicalRelation>,
    representationRelations: Array<string>
}

export type motivationConfig = {
    [motivation in Motivation]: any
}

const hierarchicalRelations: Array<HierarchicalRelation> = [
    {
        includes: "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#includes",
    }, {
        includes: "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#hasWorkPart",
        isIncludedIn: "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#isWorkPartOf"
    }
];

export const defaultConfig: ClientConfig = {
    annotationServer: {
        url: "https://annotation.clariah.nl/api"
    },
    editOptions: {
        default: {"motivations": [Motivation.BOOKMARKING, Motivation.COMMENTING, Motivation.TAGGING, Motivation.LINKING]}
    },
    motivationConfig: {
        classifying: {
            vocabularies: [
                {name: "GTAA", url: "http://openskos.beeldengeluid.nl/api/autocomplete/?q="}
            ]
        },
        linking: {
            apis: [
                {name: "custom", url: ""},
                {name: "Wikipedia", url: "https://en.wikipedia.org/w/api.php?action=opensearch&limit=20&namespace=0&format=json&search="},
                {name: "DBpedia", url: "http://lookup.dbpedia.org/api/search.asmx/PrefixSearch?QueryClass=&MaxHits=10&QueryString="},
                {name: "UNESCO", url: "http://vocabularies.unesco.org/browser/rest/v1/search?vocab=thesaurus&lang=en&labellang=en&query="}
            ]
        },
        commenting: {}
    },
    hierarchicalRelations: hierarchicalRelations,
    representationRelations: [
            "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#hasRepresentation",
            "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#isRepresentationOf"
    ]
}
