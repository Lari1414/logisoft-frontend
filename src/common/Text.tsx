import React from "react";
import { cn } from "@/lib/utils"; // oder alternativ: import cn from "classnames";

type TextProps = {
  children: React.ReactNode;
  className?: string;
};

export const H1: React.FC<TextProps> = ({ children, className }) => (
  <h1 className={cn("text-4xl font-medium tracking-tight", className)}>
    {children}
  </h1>
);

export const H2: React.FC<TextProps> = ({ children, className }) => (
  <h2 className={cn("text-2xl font-medium tracking-tight", className)}>
    {children}
  </h2>
);

export const H3: React.FC<TextProps> = ({ children, className }) => (
  <h3 className={cn("text-lg font-medium tracking-tight", className)}>
    {children}
  </h3>
);

export const P: React.FC<TextProps> = ({ children, className }) => (
  <p className={cn("text-base font-medium tracking-tight", className)}>
    {children}
  </p>
);

export const Small: React.FC<TextProps> = ({ children, className }) => (
  <small className={cn("text-sm font-medium tracking-tight", className)}>
    {children}
  </small>
);

export const Text = (props: {
  children: React.ReactNode;
  muted?: boolean;
  small?: boolean;
  center?: boolean;
  mono?: boolean;
  right?: boolean;
  className?: string;
  opacity?: number;
}) => {
  return (
    <span
      className={cn(
        "text-base",
        props.mono && "font-mono",
        props.muted && "text-muted-foreground",
        props.small && "text-sm",
        props.center && "text-center",
        props.right && "text-right",
        props.opacity && "opacity-" + props.opacity,
        props.className,
      )}
    >
      {props.children}
    </span>
  );
};
