
"use strict";

var getDisplayType = (node: HTMLElement) => {
    return window.getComputedStyle(node, "").display;
}

