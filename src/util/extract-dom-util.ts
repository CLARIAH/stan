
"use strict";

export default class DOMUtil {

    getTextNodes (node: Node) {
        let textNodes : Array<Node> = [];
        if (node.nodeType === window.Node.TEXT_NODE) {
            textNodes.push(node);
            return textNodes;
        }
        node.childNodes.forEach((childNode) => {
            if (childNode.nodeType === window.Node.TEXT_NODE) {
                textNodes.push(childNode);
            } else if (childNode.nodeType === window.Node.ELEMENT_NODE) {
                let childTextNodes = this.getTextNodes(childNode);
                textNodes = textNodes.concat(childTextNodes);
            }
        });
        return textNodes;
    }

    getElementXpath (node: HTMLElement) {
        // adjusted from https://stackoverflow.com/questions/2661818/javascript-get-xpath-of-a-node
        // node must be HTMLElement to check for id attribute
        const segs : Array<String> = [];
        for (; node && node.nodeType == 1; ) 
        { 
            if (node.hasAttribute('id')) { 
                segs.unshift(node.localName.toLowerCase() + '[@id="' + node.getAttribute('id') + '"]'); 
            /* ignoring class as this does not identify a single unambiguous element */
            //} else if (node.hasAttribute('class')) { 
            //    segs.unshift(node.localName.toLowerCase() + '[@class="' + node.getAttribute('class') + '"]'); 
            } else { 
                let sib : HTMLElement;
                node.previousSibling
                let i = 1;
                for (sib = <HTMLElement>node.previousSibling; sib; ) { 
                    if (sib.localName == node.localName)  i++; 
                    sib = <HTMLElement>sib.previousSibling
                }; 
                segs.unshift(node.localName.toLowerCase() + '[' + i + ']'); 
            }; 
            node = <HTMLElement>node.parentNode;
        }; 
        return segs.length ? '/' + segs.join('/') : null;
    }

    getXpathElement (xpath: string, contextNode: Node) {
        const ele = document.evaluate(xpath, contextNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return ele.singleNodeValue;
    }

    getDisplayType (node: HTMLElement) { window.getComputedStyle(node, "").display }

    filterTextNodes (nodes: Array<Node>) {
        return nodes.filter((node) => { return node.nodeType === window.Node.TEXT_NODE});
    }

    getDescendants (node: Node) {
        let descendants : Array<Node> = [];
        if (node.childNodes.length === 0) {
            return descendants;
        }
        node.childNodes.forEach((childNode) => {
            descendants.push(childNode);
            descendants = descendants.concat(this.getDescendants(childNode));
        });
        return descendants;
    }

    getCommonAncestor (startNode: Node, endNode: Node) {
        if (endNode.nodeType === Node.DOCUMENT_NODE) {
            return null;
        } else if (endNode.contains(startNode)) {
            return endNode;
        }
        let currNode = startNode;
        while (currNode && currNode.nodeType !== Node.DOCUMENT_NODE) {
            if (currNode.contains(endNode)) {
                return currNode;
            }
            if (currNode.parentNode) {
                currNode = currNode.parentNode;
            }
        } 
        return null;
    }

    // scopeNode is the node within previous text nodes are searched
    getPreviousTextNode (textNode: Node, scopeNode: Node) {
        if (textNode.nodeType !== Node.TEXT_NODE || !textNode.parentNode) {
            throw Error("textNode must be have nodeType Node.TEXT_NODE");
        }
        let textNodes = this.getTextNodes(scopeNode);
        if (textNodes.indexOf(textNode) > 0) {
            return textNodes[textNodes.indexOf(textNode) - 1];
        }
        // if there's only one text node
        return null;
    }
}

