
"use strict";

export default class MouseSelection {

    constructor(public startNode: Node, public startOffset: number, public endNode: Node, public endOffset: number) {
        if (startNode === endNode && startOffset === endOffset) {
            throw Error("Selection cannot be zero width (startNode is endNode and startOffset is endOffset");
        }
        this.startNode = startNode;
        this.endNode = endNode;
        this.startOffset = startOffset;
        this.endOffset = endOffset;
    }
}
