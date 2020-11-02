import DOMUtil from "./extract-dom-util";
import {} from "../model/Selector"

const domUtil = new DOMUtil();

export interface MouseSelection {
    startNode: Node,
    startOffset: number,
    endNode: Node,
    endOffset: number
}

export interface TextSelection {
    startNode: Node;
    startOffset: number;
    endNode: Node;
    endOffset: number;
    containerNode: Node;
    containerStartOffset: number;
    containerEndOffset: number;
}


export default class SelectionUtil {

    getDOMSelection () {
        const selection = document.getSelection();
        if (!selection || selection.isCollapsed || !selection.focusNode || !selection.anchorNode) {
            return null;
        } else if (this.backwardsSelection(selection)) {
            return this.makeMouseSelection(selection.focusNode, selection.focusOffset, selection.anchorNode, selection.anchorOffset);
        }  else {
            return this.makeMouseSelection(selection.anchorNode, selection.anchorOffset, selection.focusNode, selection.focusOffset);
        }
    }

    makeMouseSelection (startNode: Node, startOffset: number, endNode: Node, endOffset: number) {
        let mouseSelection: MouseSelection  = {
                startNode: startNode, 
                startOffset: startOffset, 
                endNode: endNode, 
                endOffset: endOffset
            };
        return mouseSelection;
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
        const containerNode = domUtil.getContainerNode(selection.startNode, selection.endNode);
        if (!containerNode) {
            throw Error("Invalid text selection! startNode and endNode don't have a common ancestor");
        }
        const containerStartOffset = this.findNodeOffsetInContainer(selection.startNode, containerNode);
        const containerEndOffset = this.findNodeOffsetInContainer(selection.endNode, containerNode);
        const textSelection: TextSelection = {
            startNode: selection.startNode, 
            startOffset: selection.startOffset, 
            endNode: selection.endNode, 
            endOffset: selection.endOffset, 
            containerNode: containerNode, 
            containerStartOffset: containerStartOffset, 
            containerEndOffset: containerEndOffset
        };
        return textSelection;
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
