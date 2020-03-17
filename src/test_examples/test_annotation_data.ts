export const user = {username: "a_certain_someone", password: "cannotbehacked"};
export const annotationInvalid = {
    "@context": "http://www.w3.org/ns/anno.jsonld",
    type: "Annotation",
    body: [
        {
            vocabulary: "DBpedia",
            purpose: "classifying",
            type: "Classifying",
            id: "http://dbpedia.org/resource/Vincent_van_Gogh",
            value: "Vincent van Gogh"
        }
    ],
    creator: "A. Certain Someone"
};

export const annotationValid = {
    "@context": "http://www.w3.org/ns/anno.jsonld",
    type: "Annotation",
    body: [
        {
            vocabulary: "DBpedia",
            purpose: "classifying",
            type: "Classifying",
            id: "http://dbpedia.org/resource/Vincent_van_Gogh",
            value: "Vincent van Gogh"
        }
    ],
    creator: "A. Certain Someone",
    target: [
        {
            source: "urn:vangogh:testletter.sender",
            selector: null,
            type: "Text"
        }
    ]
};


export const empty_container = {
    "@context": [
        "http://www.w3.org/ns/ldp.jsonld",
        "http://www.w3.org/ns/anno.jsonld"
    ],
    "id": "http://localhost:3000/api/annotations?iris=0",
    "total": 0,
    "type": [
        "BasicContainer",
        "AnnotationContainer"
    ]
}

export const filled_container = {
    "@context": [
        "http://www.w3.org/ns/ldp.jsonld",
        "http://www.w3.org/ns/anno.jsonld"
    ],
    "id": "http://localhost:3000/api/annotations?iris=0",
    "total": 1,
    "type": [
        "BasicContainer",
        "AnnotationContainer"
    ],
    "first": {
        "id": "http://localhost:3000/api/annotations?iris=0&page=0",
        "type": "AnnotationPage",
        "items": [
            annotationValid
        ]
    },
    "last": "http://localhost:3000/api/annotations?iris=0&page=0"
}

export const nested_PID_annotation = {
    "@context": "http://www.w3.org/ns/anno.jsonld",
    "type": "Annotation",
    "motivation": null,
    "creator": "marijn",
    "target": [
        {
            "source": "urn:vangogh/letter=001:para=5",
            "selector": {
                "@context": "http://boot.huygens.knaw.nl/annotate/swao.jsonld",
                "type": "NestedPIDSelector",
                "value": [
                    {
                        "id": "urn:vangogh/letter=001",
                        "property": null,
                        "type": [
                            "Letter"
                        ]
                    },
                    {
                        "id": "urn:vangogh/letter=001:para=5",
                        "property": "http://localhost:8080/ontologies/editionannotationontology.ttl#hasWorkPart",
                        "type": [
                            "vg:ParagraphInLetter"
                        ]
                    }
                ],
                "refinedBy": [
                    {
                        "type": "TextPositionSelector",
                        "start": 76,
                        "end": 87
                    },
                    {
                        "type": "TextQuoteSelector",
                        "prefix": "je wandelingen naar ",
                        "suffix": ". Gisteren is het ha",
                        "exact": "Ois[ter]wijk"
                    }
                ]
            },
            "scope": "http://localhost:8080/vgdemo1/work/original.html",
            "type": "Text"
        }
    ],
    "body": [
        {
            "value": "Theo attended secondary school in Oisterwijk in the province of North Brabant. He walked the 6 km to school from his parents’ house in Helvoirt. The fact that Vincent assumes Theo must have felt ‘anxious’ during these long walks must have something to do with the stormy autumn weather: they were having at the time, which included frequent showers, strong winds and occasional thunderstorms (KNMI).",
            "purpose": "commenting",
            "type": "comment"
        }
    ],
    "id": "urn:uuid:23e7937a-d077-4515-83e0-95ea8f25200c",
    "created": "2019-02-21T13:06:58.600203+00:00",
    "modified": "2019-02-21T13:15:26.419178+00:00"
}

const getAnnotationsReply = {
    "@context": [
        "http://www.w3.org/ns/ldp.jsonld",
        "http://www.w3.org/ns/anno.jsonld"
    ],
    "id": "http://localhost:3000/api/annotations?iris=1",
    "total": 0,
    "type": [
        "BasicContainer",
        "AnnotationContainer"
    ],
    "first": "http://localhost:3000/api/annotations?iris=1&page=0",
    "last": "http://localhost:3000/api/annotations?iris=1&page=0"
}