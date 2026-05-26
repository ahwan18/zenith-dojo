import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import { Slot } from "@/shared/components/Slot/Slot";

import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  asChild?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  asChild = false,
  className,
  children,
  ...rest
}: ButtonProps): ReactElement {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      className={[styles.button, styles[variant], className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </Component>
  );
}

