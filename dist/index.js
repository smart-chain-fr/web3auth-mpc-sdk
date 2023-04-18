"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./jsx");
const Popup_1 = __importDefault(require("./Popup"));
customElements.define("w3ac-modal", Popup_1.default);
