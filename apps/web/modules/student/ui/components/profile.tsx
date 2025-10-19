import { format } from "date-fns";
import {
  BookOpen,
  Calendar,
  Globe,
  GraduationCap,
  Home,
  MapPin,
  Phone,
  User,
  Wallet,
} from "lucide-react";

import { Student } from "@workspace/db";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";

interface StudentProfileProps {
  student: Student;
}

export const StudentProfile = ({ student }: StudentProfileProps) => {
  return (
    <div className="space-y-4 w-full">
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 h-full items-stretch">
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card px-2 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs w-full overflow-hidden h-full">
          <Card className="rounded-xs p-3 gap-y-3 w-full overflow-hidden h-full">
            <CardHeader className="px-0">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="w-5 h-5 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col gap-y-3 w-full overflow-x-auto">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2">
                  <label className="font-medium">Name (Bangla)</label>
                  <p className="text-muted-foreground mt-1">
                    {student.nameBangla}
                  </p>
                </div>
                <div>
                  <label className="font-medium">Father's Name</label>
                  <p className="text-muted-foreground mt-1">{student.fName}</p>
                </div>
                <div>
                  <label className="font-medium">Mother's Name</label>
                  <p className="text-muted-foreground mt-1">{student.mName}</p>
                </div>
                <div>
                  <label className="font-medium">Date of Birth</label>
                  <p className="text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(student.dob), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <label className="font-medium">Gender</label>
                  <p className="text-muted-foreground mt-1">{student.gender}</p>
                </div>
                <div>
                  <label className="font-medium">Nationality</label>
                  <p className="text-muted-foreground mt-1 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {student.nationality}
                  </p>
                </div>
                <div>
                  <label className="font-medium">Religion</label>
                  <p className="text-muted-foreground mt-1">
                    {student.religion}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  Contact Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <label className="font-medium">Father's Phone</label>
                    <p className="text-muted-foreground mt-1">
                      {student.fPhone}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium">Mother's Phone</label>
                    <p className="text-muted-foreground mt-1">
                      {student.mPhone}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card px-2 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs w-full overflow-hidden h-full">
          <Card className="rounded-xs p-3 gap-y-3 w-full overflow-hidden h-full">
            <CardHeader className="px-0">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MapPin className="w-5 h-5 text-red-600" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col gap-y-3 w-full overflow-x-auto">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Present Address
                </h4>
                <div className="text-sm space-y-1 pl-6 border-l-2 border-blue-200">
                  <p className="text-muted-foreground">
                    {student.presentHouseNo}, {student.presentMoholla}
                  </p>
                  <p className="text-muted-foreground">
                    {student.presentPost}, {student.presentThana}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Permanent Address
                </h4>
                <div className="text-sm space-y-1 pl-6 border-l-2 border-green-200">
                  <p className="text-muted-foreground">
                    {student.permanentVillage}
                  </p>
                  <p className="text-muted-foreground">
                    {student.permanentPost}, {student.permanentThana}
                  </p>
                  <p className="text-muted-foreground">
                    {student.permanentDistrict}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card px-2 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs w-full overflow-hidden h-full">
          <Card className="rounded-xs p-3 gap-y-3 w-full overflow-hidden h-full">
            <CardHeader className="px-0">
              <CardTitle className="flex items-center gap-2 text-xl">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                Academic Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col gap-y-3 w-full overflow-x-auto">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium">Student ID</label>
                  <p className="text-muted-foreground mt-1">
                    {student.studentId}
                  </p>
                </div>
                <div>
                  <label className="font-medium">Session</label>
                  <p className="text-muted-foreground mt-1">
                    {student.session}
                  </p>
                </div>
                <div>
                  <label className="font-medium">School</label>
                  <p className="text-muted-foreground mt-1 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {student.school}
                  </p>
                </div>
                <div>
                  <label className="font-medium">Roll</label>
                  <p className="text-muted-foreground mt-1">{student.roll}</p>
                </div>
                {student.section && (
                  <div>
                    <label className="font-medium">Section</label>
                    <p className="text-muted-foreground mt-1">
                      {student.section}
                    </p>
                  </div>
                )}
                {student.shift && (
                  <div>
                    <label className="font-medium">Shift</label>
                    <p className="text-muted-foreground mt-1">
                      {student.shift}
                    </p>
                  </div>
                )}
                {student.group && (
                  <div>
                    <label className="font-medium">Group</label>
                    <p className="text-muted-foreground mt-1">
                      {student.group}
                    </p>
                  </div>
                )}
                <div>
                  <label className="font-medium">Type</label>
                  <Badge variant="secondary" className="mt-1">
                    {student.type}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-green-600" />
                  Fee Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="font-medium">Admission Fee</label>
                    <p className="text-muted-foreground mt-1">
                      ৳{student.admissionFee}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium">Salary Fee</label>
                    <p className="text-muted-foreground mt-1">
                      ৳{student.salaryFee}
                    </p>
                  </div>
                  {student.courseFee && (
                    <div>
                      <label className="font-medium">Course Fee</label>
                      <p className="text-muted-foreground mt-1">
                        ৳{student.courseFee}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
