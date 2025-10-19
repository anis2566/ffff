import { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../components/card";
import { NumberTicker } from "../components/number-ticker";
import { Progress } from "../components/progress";

interface StatCardProps {
  title: string;
  description?: string;
  primaryValue: number;
  secondaryValue?: number;
  icon: LucideIcon;
  percent?: number;
}

export const AnalyticStatCard = ({
  title,
  description,
  primaryValue,
  secondaryValue,
  icon: Icon,
  percent,
}: StatCardProps) => {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs w-full overflow-hidden">
      <Card className="rounded-xs p-3 gap-y-3 w-full overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="text-muted-foreground">
            <Icon className="mr-2 h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-baseline">
            <NumberTicker
              startValue={0}
              value={primaryValue}
              direction="up"
              className="text-2xl font-semibold"
            />
            <p className="text-sm text-muted-foreground">/ {secondaryValue}</p>
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-1 gap-x-2 mt-2">
            <Progress value={percent} className="h-2" />
            <span>{percent}%</span>
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-3">{description}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
