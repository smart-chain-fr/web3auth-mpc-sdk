import type React from "react";
import { IModalProps } from "./Popup";
declare global {
    namespace JSX {
        interface IntrinsicElements {
            "w3ac-modal": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement & IModalProps>, HTMLElement & IModalProps> & IModalProps;
        }
    }
}
export {};
