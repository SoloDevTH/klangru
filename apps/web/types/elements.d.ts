import type { DetailedHTMLProps, HTMLAttributes, Ref } from "react";

// <math-field> ของ MathLive เป็น web component
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "math-field": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        ref?: Ref<HTMLElement & { value: string }>;
        class?: string;
        "math-virtual-keyboard-policy"?: "auto" | "manual" | "sandboxed";
      };
    }
  }
}
