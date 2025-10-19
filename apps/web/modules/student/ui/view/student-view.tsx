"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { CheckCircle, DollarSign, User } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { STUDENT_STATUS } from "@workspace/utils/constant";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Salaries } from "../components/salaries";
import { StudentProfile } from "../components/profile";
import { Attendances } from "../components/attendances";
import { Homeworks } from "../components/homeworks";
import { Results } from "../components/results";

interface StudentViewProps {
  id: string;
}

export const StudentView = ({ id }: StudentViewProps) => {
  const trpc = useTRPC();

  const { data: student } = useSuspenseQuery(
    trpc.student.getOne.queryOptions(id)
  );

  return (
    <div className="w-full space-y-4">
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card px-2 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs w-full overflow-hidden">
        <Card className="rounded-xs p-3 gap-y-3 w-full overflow-hidden">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={student?.imageUrl || ""} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {student.name
                    .split(" ")
                    .map((name) => name.charAt(0))
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <div>
                  <CardTitle className="text-3xl font-bold mb-2">
                    {student.name}
                  </CardTitle>
                  <CardDescription className="text-lg flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    Student ID: {student.studentId} • Session: {student.session}
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant={
                      student?.studentStatus?.status === STUDENT_STATUS.Present
                        ? "default"
                        : "destructive"
                    }
                    className={`px-3 py-1 font-medium rounded-full`}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {student?.studentStatus?.status}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    <DollarSign className="w-3 h-3 mr-1" /> ৳{" "}
                    {student.salaryFee} / month
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="salaries" className="w-full">
        <TabsList className="w-full rounded-xs mb-2 bg-muted">
          <TabsTrigger value="salaries">Salaries</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="result">Result</TabsTrigger>
          <TabsTrigger value="homework">Homework</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="salaries">
          <Salaries studentId={id} />
        </TabsContent>
        <TabsContent value="attendance">
          <Attendances studentId={id} />
        </TabsContent>
        <TabsContent value="homework">
          <Homeworks studentId={id} />
        </TabsContent>
        <TabsContent value="result">
          <Results studentId={id} />
        </TabsContent>
        <TabsContent value="profile">
          <StudentProfile student={student} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
