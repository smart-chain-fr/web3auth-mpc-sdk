import type React from "react";
import { IModalProps } from "./Modal";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "w3ac-signinup": HTMLElement;
      "w3ac-modal": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement & IModalProps>,
        HTMLElement & IModalProps
      > &
        IModalProps;
    }
  }
}

export {};
