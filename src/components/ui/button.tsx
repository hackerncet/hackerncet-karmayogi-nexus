import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...values: Parameters<typeof clsx>) {
  return twMerge(clsx(values));
}
const variants = cva("button", {
  variants: {
    variant: {
      default: "button-primary",
      outline: "button-outline",
      ghost: "button-ghost",
      danger: "button-danger",
    },
    size: { default: "", sm: "button-sm" },
  },
  defaultVariants: { variant: "default", size: "default" },
});
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof variants>;
export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(variants({ variant, size }), className)} {...props} />
  );
}
