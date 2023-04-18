import type React from "react";
import { ILoginViewProps } from "./LoginView";
declare global {
    namespace JSX {
        interface IntrinsicElements {
            "w3ac-login-view": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement & ILoginViewProps>, HTMLElement & ILoginViewProps>;
        }
    }
}
export {};
