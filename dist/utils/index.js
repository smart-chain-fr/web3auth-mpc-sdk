"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createElementFromString(htmlString, parentElement = null) {
    const div = document.createElement("div");
    div.innerHTML = htmlString.trim();
    const child = div.firstElementChild;
    if (parentElement && child)
        parentElement.appendChild(child);
    return child;
}
exports.default = createElementFromString;
