
"use strict";

export default class TextSelection {

    constructor(public startNode: Node, public startOffset: number, public endNode: Node, public endOffset: number, public containerNode: Node, public containerStartOffset: number, public containerEndOffset: number) {
        this.startNode = startNode;
        this.endNode = endNode;
        this.startOffset = startOffset;
        this.endOffset = endOffset;
        this.containerNode = containerNode;
        this.containerStartOffset = containerStartOffset;
        this.containerEndOffset = containerEndOffset;
    }
}