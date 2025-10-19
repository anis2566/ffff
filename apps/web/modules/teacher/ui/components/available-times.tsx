import { Clock, Calendar } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { groupByDay } from "@workspace/utils/constant";

interface AvailableTimesDisplayProps {
  availableTimes: string[];
}

interface TimeSlot {
  day: string;
  slots: string[];
}

export function AvailableTimes({ availableTimes }: AvailableTimesDisplayProps) {
  const formatedSlots = groupByDay(availableTimes);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card px-2 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs w-full overflow-hidden h-full">
      <Card className="rounded-xs px-0 gap-y-3 w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Available Times
            </div>
            <Badge variant="secondary">{availableTimes.length / 2} hours</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formatedSlots.map((item, index) => (
            <div key={index} className="border p-4 bg-background/60">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold">{item.day}</h4>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {item.times.length / 2} hours
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {item.times.map((i, rangeIndex) => (
                  <Badge
                    key={rangeIndex}
                    variant="secondary"
                    className="uppercase"
                  >
                    <Clock className="w-2 h-2 mr-1" />
                    {i}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
