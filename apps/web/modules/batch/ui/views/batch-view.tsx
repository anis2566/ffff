"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { formatTime } from "@workspace/utils/constant";
import { BookOpen, Clock, MapPin, TrendingUp, Users } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Students } from "../components/students";
import { Schedule } from "../components/schedule";
import { Teachers } from "../components/teachers";

interface BatchViewProps {
  id: string;
}

export const BatchView = ({ id }: BatchViewProps) => {
  const trpc = useTRPC();

  const { data: batch } = useSuspenseQuery(trpc.batch.getOne.queryOptions(id));

  return (
    <div className="space-y-4 w-full">
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card px-2 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs w-full overflow-hidden">
        <Card className="rounded-xs p-3 gap-y-3 w-full overflow-hidden">
          <CardContent className="p-0 flex flex-col gap-y-3 w-full overflow-x-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted dark:bg-background rounded-xs">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{batch.name}</h3>
                  <Badge variant="secondary">{batch.level}</Badge>
                </div>
              </div>
            </div>
            <Separator />
            <div className="w-full flex items-center flex-col md:flex-row gap-4">
              <div className="flex items-center gap-3 px-3 rounded-lg">
                <div className="p-2 bg-muted dark:bg-background rounded-full">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm">Class</p>
                  <p className="font-medium text-muted-foreground">
                    {batch.batchClassName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-3 rounded-lg">
                <div className="p-2 bg-muted dark:bg-background rounded-full">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm">Room</p>
                  <p className="font-medium text-muted-foreground">
                    {batch.roomName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-3 rounded-lg">
                <div className="p-2 bg-muted dark:bg-background rounded-full">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm">Capacity</p>
                  <p className="font-medium text-muted-foreground">
                    {batch.capacity}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-3 rounded-lg">
                <div className="p-2 bg-muted dark:bg-background rounded-full">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm">Schedule</p>
                  <Badge variant="outline">
                    {formatTime(batch.time[0] ?? "", "start")} -{" "}
                    {formatTime(batch.time[batch.time.length - 1] ?? "", "end")}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedule" className="w-[100%] mx-auto">
        <TabsList className="w-full rounded-xs mb-2 bg-muted">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="homework">Homework</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
        </TabsList>
        <TabsContent value="schedule">
          <Schedule
            batchId={id}
            batchTimes={batch.classTime}
            level={batch.level}
          />
        </TabsContent>
        <TabsContent value="students">
          <Students batchId={id} className={batch.batchClassName} />
        </TabsContent>
        <TabsContent value="teachers">
          <Teachers batchId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
