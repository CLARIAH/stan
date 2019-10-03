"use strict";
var getDisplayType = function (node) {
    return window.getComputedStyle(node, "").display;
};
