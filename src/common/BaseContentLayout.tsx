import React from "react";
import { Col, FlexOne, Row } from "@/common/flex/Flex.tsx";
import { H2 } from "@/common/Text.tsx";
import { Loader2, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

interface BaseContentLayout {
  title: string;
  children?: React.ReactNode;
  primaryCallToActionButton?: {
    text: string;
    icon: LucideIcon;
    onClick: () => void;
    isLoading: boolean;
  };
}

export const BaseContentLayout: React.FC<BaseContentLayout> = (props) => {
  return (
    <Col className={"p-4"}>
      <Row>
        <H2>{props.title}</H2>
        <FlexOne />
        {props.primaryCallToActionButton && (
          <Button
            disabled={props.primaryCallToActionButton.isLoading}
            onClick={() => {
              props.primaryCallToActionButton?.onClick();
            }}
          >
            <>
              {props.primaryCallToActionButton.isLoading ? (
                <Loader2 className={cn("h-4 w-4 animate-spin")} />
              ) : (
                <props.primaryCallToActionButton.icon className="h-4 w-4" />
              )}
              {props.primaryCallToActionButton?.text}
            </>
          </Button>
        )}
      </Row>
      <Row f1>{props.children}</Row>
    </Col>
  );
};
