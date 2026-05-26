import type { ReactElement, ReactNode } from "react";
import { isValidElement, cloneElement } from "react";

interface SlotProps {
  children: ReactNode;
  className?: string;
}

export function Slot({ children, className }: SlotProps): ReactElement {
  if (!isValidElement(children)) {
    throw new Error("Slot expects a single valid React element child.");
  }

  const mergedClassName = [children.props.className, className].filter(Boolean).join(" ");
  return cloneElement(children, { className: mergedClassName });
}

