import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/card";
import { Separator } from "../components/separator";
import { cn } from "../lib/utils";

interface CardWrapperProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  contentClassName?: string;
}

export const CardWrapper = ({
  children,
  className,
  title,
  description,
  contentClassName,
}: CardWrapperProps) => {
  return (
    <Card
      className={cn(
        "w-full px-2 rounded-xs p-3 gap-y-3 shadow-xs bg-gradient-to-t from-primary/5 to-card dark:bg-card",
        className
      )}
    >
      {title && (
        <CardHeader className="px-0">
          <CardTitle className="capitalize">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
          <Separator />
        </CardHeader>
      )}
      <CardContent className={cn("p-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
};
