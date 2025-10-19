"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { TEACHER_STATUS } from "@workspace/utils/constant";
import { CheckCircle, DollarSign, GraduationCap, User } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { AvailableTimes } from "../components/available-times";
import { Profile } from "../components/profile";
import { Schedule } from "../components/schedule";
import { Advances } from "../components/advances";
import { Salaries } from "../components/salaries";

interface TeacherViewProps {
  teacherId: string;
}

export const TeacherView = ({ teacherId }: TeacherViewProps) => {
  const trpc = useTRPC();

  const { data: teacher } = useSuspenseQuery(
    trpc.teacher.getOne.queryOptions(teacherId)
  );

  return (
    <div className="w-full space-y-4">
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card px-2 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs w-full overflow-hidden">
        <Card className="rounded-xs p-3 gap-y-3 w-full overflow-hidden">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-18 h-18 border-4 border-white shadow-lg">
                <AvatarImage src={teacher.imageUrl || ""} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {teacher.name
                    .split(" ")
                    .map((name) => name.charAt(0))
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <div>
                  <CardTitle className="text-xl font-bold">
                    {teacher.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    Teacher ID: {teacher.teacherId} • Session: {teacher.session}
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant={
                      teacher.teacherStatus?.status === TEACHER_STATUS.Present
                        ? "default"
                        : "destructive"
                    }
                    className={`px-3 py-1 font-medium rounded-full`}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {teacher.teacherStatus?.status}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    {teacher.currentSubject}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    <DollarSign className="w-3 h-3 mr-1" />৳{teacher.classRate}
                    /class
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex flex-col gap-y-3 w-full overflow-x-auto"></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="w-full rounded-xs mb-2 bg-muted">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="salary">Salary</TabsTrigger>
          <TabsTrigger value="advance">Advance</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="schedule">
          <Schedule teacherId={teacherId} />
        </TabsContent>
        <TabsContent value="availability">
          <AvailableTimes availableTimes={teacher.availableSlots} />
        </TabsContent>
        <TabsContent value="salary">
          <Salaries teacherId={teacherId} />
        </TabsContent>
        <TabsContent value="advance">
          <Advances teacherId={teacherId} />
        </TabsContent>
        <TabsContent value="profile">
          <Profile teacher={teacher} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
