"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModalStyle = void 0;
exports.ModalStyle = `
    .popup {
        padding: 16px;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #FFFFFF;
        border-radius: 16px;
        box-shadow: 0px 6px 12px rgba(17, 24, 39, 0.11);
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 493px;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    .title {
        margin: 0;
        font-family: "Inter";
        font-weight: 700;
        font-size: 24px;
        line-height: 32px;
        color: #111827;
        letter-spacing: -0.02em;
    }
    
    .close-button {
        cursor: pointer;
    }`;
