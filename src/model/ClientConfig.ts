
export enum configProperties {
    HIERARCHICALRELATIONS = "hierarchicalRelations",
    ANNOTATIONSERVER = "annotationServer"
}

export interface HierarchicalRelation {
    includes: string,
    isIncludedIn?: string
}

export interface ClientConfig {
    annotationServer: {
        url: string
    },
    hierarchicalRelations?: Array<HierarchicalRelation>,
    representationRelations?: Array<string>
}

export const baseConfig: ClientConfig = {
    annotationServer: {
        url: "http://annotation.server.address"
    }
}

const hierarchicalRelations: Array<HierarchicalRelation> = [
    {
        includes: "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#includes",
    }, {
        includes: "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#hasWorkPart",
        isIncludedIn: "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#isWorkPartOf"
    }
];

export const externalConfig: ClientConfig = {
    annotationServer: {
        url: "http://annotation.server.address"
    },
    hierarchicalRelations: hierarchicalRelations,
    representationRelations: [
            "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#hasRepresentation",
            "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#isRepresentationOf"
    ]
}
