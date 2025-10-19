import { LucideIcon, PlusCircle } from "lucide-react";

import { Button } from "../components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/card";
import { Separator } from "../components/separator";

import { cn } from "../lib/utils";

interface ListCardWrapperProps {
  children: React.ReactNode;
  title: string;
  value?: number;
  className?: string;
  actionButtons?: Boolean;
  onClickAction?: () => void;
  actionButtonText?: string;
  actionButtonIcon?: LucideIcon;
  actionButtonVariant?: "default" | "destructive" | "outline" | "secondary";
}

export const ListCardWrapper = ({
  children,
  title,
  value,
  className,
  actionButtons,
  onClickAction,
  actionButtonText = "Add New",
  actionButtonVariant = "default",
  actionButtonIcon: Icon = PlusCircle,
}: ListCardWrapperProps) => {
  return (
    <Card
      className={cn(
        "w-full px-2 rounded-xs p-3 gap-y-3 shadow-xs bg-gradient-to-t from-primary/5 to-card dark:bg-card",
        className
      )}
    >
      <CardHeader className="px-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <CardTitle>{title}</CardTitle>
            {value !== undefined && (
              <CardDescription>{value} items found</CardDescription>
            )}
          </div>
          {actionButtons && (
            <Button
              className="rounded-full"
              onClick={onClickAction}
              variant={actionButtonVariant}
            >
              <Icon className="h-4 w-4" />
              <span onClick={onClickAction}>{actionButtonText}</span>
            </Button>
          )}
        </div>
        <Separator />
      </CardHeader>
      <CardContent className="p-0 flex flex-col gap-y-3 w-full overflow-x-auto">
        {children}
      </CardContent>
    </Card>
  );
};
