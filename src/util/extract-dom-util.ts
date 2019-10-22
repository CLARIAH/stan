
"use strict";

const DOMUtil = {

    getTextNodes : (node: Node) => {
        var textNodes : Array<Node> = [];
        if (node.nodeType === window.Node.TEXT_NODE) {
            textNodes.push(node);
            return textNodes;
        }
        node.childNodes.forEach((childNode) => {
            if (childNode.nodeType === window.Node.TEXT_NODE) {
                textNodes.push(childNode);
            } else if (childNode.nodeType === window.Node.ELEMENT_NODE) {
                let childTextNodes = DOMUtil.getTextNodes(childNode);
                textNodes = textNodes.concat(childTextNodes);
            }
        });
        return textNodes;
    },

    getElementXpath : (node: HTMLElement) => {
        // adjusted from https://stackoverflow.com/questions/2661818/javascript-get-xpath-of-a-node
        var allNodes = document.getElementsByTagName('*'); 
        for (var segs = []; node && node.nodeType == 1; ) 
        { 
            if (node.hasAttribute('id')) { 
                    var uniqueIdCount = 0; 
                    for (var n=0;n < allNodes.length;n++) { 
                        if (allNodes[n].hasAttribute('id') && allNodes[n].id == node.id) uniqueIdCount++; 
                        if (uniqueIdCount > 1) break; 
                    }; 
                    if ( uniqueIdCount == 1) { 
                        segs.unshift('id("' + node.getAttribute('id') + '")'); 
                        return segs.join('/'); 
                    } else { 
                        segs.unshift(node.localName.toLowerCase() + '[@id="' + node.getAttribute('id') + '"]'); 
                    } 
            } else if (node.hasAttribute('class')) { 
                segs.unshift(node.localName.toLowerCase() + '[@class="' + node.getAttribute('class') + '"]'); 
            } else { 
                var sib : HTMLElement;
                node.previousSibling
                for (var i = 1, sib = <HTMLElement>node.previousSibling; sib; ) { 
                    if (sib.localName == node.localName)  i++; 
                    sib = <HTMLElement>sib.previousSibling
                }; 
                segs.unshift(node.localName.toLowerCase() + '[' + i + ']'); 
            }; 
            node = <HTMLElement>node.parentNode;
        }; 
        return segs.length ? '/' + segs.join('/') : null;
    },

    getXpathElement : (xpath: string, contextNode: Node) => {
        return document.evaluate(xpath, contextNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    },


    getDisplayType : (node: HTMLElement) => window.getComputedStyle(node, "").display,

    filterTextNodes : (nodes: Array<Node>) => {
        return nodes.filter((node) => { return node.nodeType === window.Node.TEXT_NODE});
    },

    getDescendants : (node: Node) => {
        let descendants : Array<Node> = [];
        if (node.childNodes.length === 0) {
            return descendants;
        }
        node.childNodes.forEach((childNode) => {
            descendants.push(childNode);
            descendants = descendants.concat(DOMUtil.getDescendants(childNode));
        });
        return descendants;
    },

    getCommonAncestor : (startNode: Node, endNode: Node) => {
        if (endNode.contains(startNode)) {
            return endNode;
        }
        let currNode = startNode;
        while (currNode) {
            if (currNode.contains(endNode)) {
                return currNode;
            }
            if (currNode.parentNode) {
                currNode = currNode.parentNode;
            }
        } 
        return null;
    }
}

export default DOMUtil;
//module.exports = getDisplayType;
