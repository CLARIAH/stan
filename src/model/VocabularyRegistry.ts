

export default class VocabularyRegistry {

    constructor(public baseVocabulary: string) {
        this.baseVocabulary = baseVocabulary;
    }

    public ignorableElementClass() {
        return this.baseVocabulary + "#IgnorableElement";
    }

    public ignorableTagClass() {
        return this.baseVocabulary + "#IgnorableElement";
    }

}