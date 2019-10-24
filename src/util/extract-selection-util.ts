
"use strict";

import DOMUtil from "./extract-dom-util";
import MouseSelection from "../model/MouseSelection";
import TextSelection from "../model/TextSelection";

const domUtil = new DOMUtil();

export default class SelectionUtil {

    getDOMSelection () {
        const selection = document.getSelection();
        if (!selection || selection.isCollapsed || !selection.focusNode || !selection.anchorNode) {
            return null;
        } else if (this.backwardsSelection(selection)) {
            return new MouseSelection(selection.focusNode, selection.focusOffset, selection.anchorNode, selection.anchorOffset);
        }  else {
            return new MouseSelection(selection.anchorNode, selection.anchorOffset, selection.focusNode, selection.focusOffset);
        }
    }

    backwardsSelection (selection: Selection | null) {
        if (!selection || !selection.anchorNode || !selection.focusNode) {
            return false;
        } else if (selection.anchorNode === selection.focusNode && selection.anchorOffset > selection.focusOffset) {
            return true;
        } else {
            return this.preceeds(selection.focusNode, selection.anchorNode);
        }
    }
    
    makeTextSelection (selection: MouseSelection) {
        const containerNode = domUtil.getCommonAncestor(selection.startNode, selection.endNode);
        if (!containerNode) {
            throw Error("Invalid text selection! startNode and endNode don't have a common ancestor");
        }
        const containerStartOffset = this.findNodeOffsetInContainer(selection.startNode, containerNode);
        const containerEndOffset = this.findNodeOffsetInContainer(selection.endNode, containerNode);
        return new TextSelection(selection.startNode, selection.startOffset, selection.endNode, selection.endOffset, containerNode, containerStartOffset, containerEndOffset);
    }

    preceeds (node1: Node, node2: Node) {
        const position = node2.compareDocumentPosition(node1);
        const preceeds = position & Node.DOCUMENT_POSITION_PRECEDING;
        return preceeds > 0;
    }

    findNodeOffsetInContainer(node: Node, containerNode: Node) {
        if (!containerNode.contains(node)) {
            throw Error("node is part of containerNode");
        }
        let offset: number = 0;
        let done = false;
        const textNodes = domUtil.getTextNodes(containerNode);
        textNodes.some(textNode => {
            if (node.contains(textNode) || this.preceeds(node, textNode)) {
                return true;
            } else {
                if (textNode && textNode.textContent) {
                    offset = offset + textNode.textContent.length;
                }
                return false;
            }
        });
        return offset;
   }

}