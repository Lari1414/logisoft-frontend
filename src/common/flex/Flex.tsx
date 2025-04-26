import React, { forwardRef } from "react";
import { cn } from "@/lib/utils.ts";

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "col";
  justify?: "start" | "end" | "center" | "between" | "around" | "stretch";
  align?: "start" | "end" | "center" | "stretch";
  gap?: 0 | 1 | 2 | 4 | 6 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 56 | 64;
  children?: React.ReactNode;
  f1?: boolean;
  className?: string;
}

export const Flex = forwardRef<HTMLDivElement, FlexProps>((props, ref) => {
  const {
    direction = "row",
    justify = "start",
    align = "stretch",
    gap = 4,
    children,
    className = "",
    f1 = false,
    ...tail
  } = props;

  return (
    <div
      ref={ref}
      className={cn(
        `flex-${direction} justify-${justify} items-${align} gap-${gap} flex`,
        f1 && "flex-1",
        className,
      )}
      {...tail}
    >
      {children}
    </div>
  );
});

export const Col: React.FC<FlexProps> = (props) => {
  return <Flex direction="col" {...props} />;
};

export const Row: React.FC<FlexProps> = (props) => {
  return <Flex direction="row" {...props} />;
};

export const FlexOne: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return <div className="flex-1">{children}</div>;
};
