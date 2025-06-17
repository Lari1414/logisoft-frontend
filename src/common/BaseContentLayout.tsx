import React from "react";
import { Col, FlexOne, Row } from "@/common/flex/Flex.tsx";
import { H2 } from "@/common/Text.tsx";
import { Loader2, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
//import { cn } from "@/lib/utils.ts";

interface BaseContentLayout {
  title: string;
  children?: React.ReactNode;
  primaryCallToActionButton?: {
    text: string;
    icon: LucideIcon;
    onClick: () => void;
    isLoading: boolean;
    disabled?: boolean;
  };
  secondaryActions?: React.ReactNode;

}

export const BaseContentLayout: React.FC<BaseContentLayout> = (props) => {
  return (
    <Col className={"p-4"}>
      <Row className="items-center">
        <H2>{props.title}</H2>
        <FlexOne />
        {/* ✅ Erst sekundäre Aktionen */}
        {props.secondaryActions && (
          <div className="flex gap">{props.secondaryActions}</div>
        )}
        {/* ✅ Dann der primäre Button */}
        {props.primaryCallToActionButton && (
          <Button
            disabled={
              props.primaryCallToActionButton.isLoading ||
              props.primaryCallToActionButton.disabled
            }
            onClick={props.primaryCallToActionButton.onClick}
          >
            {props.primaryCallToActionButton.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <props.primaryCallToActionButton.icon className="h-4 w-4 mr-2" />
            )}
            {props.primaryCallToActionButton.text}
          </Button>
        )}
      </Row>
      <Row f1>{props.children}</Row>
    </Col>
  );
};
