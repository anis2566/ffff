import { DollarSign, User } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";

interface StudentProfileProps {
  month: string;
  student: {
    name: string;
    imageUrl: string | null;
    className: {
      name: string;
    };
    salaryFee: number;
    studentId: number;
  };
}

export const SalaryStudentProfile = ({
  student,
  month,
}: StudentProfileProps) => {
  if (!student) {
    return null;
  }

  return (
    <Card className="rounded-xs p-3 gap-y-3 w-full overflow-hidden">
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
            <AvatarImage src={student?.imageUrl || ""} />
            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {student.name
                .split(" ")
                .map((name) => name.charAt(0))
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div>
              <CardTitle className="text-xl font-bold">
                {student.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                Student ID: {student.studentId} • Class:{" "}
                {student.className.name}
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge className="px-3 py-1 rounded-full">
                <DollarSign className="w-3 h-3" /> {month}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <DollarSign className="w-3 h-3" /> ৳ {student.salaryFee} / month
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
