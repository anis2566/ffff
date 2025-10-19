import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/card";
import { Separator } from "../components/separator";
import { cn } from "../lib/utils";

interface FormCardWrapperProps {
  children: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export const FormCardWrapper = ({
  children,
  title,
  description,
  className,
}: FormCardWrapperProps) => {
  return (
      <Card
        className={cn(
            "w-full px-2 rounded-xs p-3 gap-y-3 shadow-xs bg-gradient-to-t from-primary/5 to-card dark:bg-card",
            className
        )}
      >
        <CardHeader className="px-0">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <Separator />
        </CardHeader>
        <CardContent className="p-0">{children}</CardContent>
      </Card>
  );
};
