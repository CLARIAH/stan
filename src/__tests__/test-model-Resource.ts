import Resource from "../model/Resource";

const makeRDFaAttributes = () => {
    return {
        about: "urn:div=1",
        resource: "urn:div=1",
        vocab: "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl",
        prefix: null,
        typeof: "Poem",
        property: "Work",
        text: "Some text that doesn't rhyme.",
    }
}

test("Resource returns a valid resource", () => {
    const attrs = makeRDFaAttributes();
    const node = document.createElement("div");
    const resource = new Resource(node, attrs.about, attrs.typeof, attrs.property, null, true, attrs.text);
    expect(resource).not.toBe(null);
});

test("Resource without parent returns a null for parent property", () => {
    const attrs = makeRDFaAttributes();
    const node = document.createElement("div");
    const resource = new Resource(node, attrs.about, attrs.typeof, attrs.property, null, true, attrs.text);
    expect(resource.parent).toBe(null);
});