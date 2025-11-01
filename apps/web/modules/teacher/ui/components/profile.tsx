import { format } from "date-fns";
import {
  BookOpen,
  Calendar,
  Globe,
  GraduationCap,
  Home,
  MapPin,
  Phone,
  School,
  User,
} from "lucide-react";

import { Teacher } from "@workspace/db";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";

interface ProfileProps {
  teacher: Teacher;
}

export const Profile = ({ teacher }: ProfileProps) => {
  return (
    <div className="space-y-4 w-full">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 h-full items-stretch">
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
                <div>
                  <label className="font-medium">Father's Name</label>
                  <p className="text-muted-foreground mt-1">{teacher.fName}</p>
                </div>
                <div>
                  <label className="font-medium">Mother's Name</label>
                  <p className="text-muted-foreground mt-1">{teacher.mName}</p>
                </div>
                <div>
                  <label className="font-medium">Date of Birth</label>
                  <p className="text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(teacher.dob), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <label className="font-medium">Gender</label>
                  <p className="text-muted-foreground mt-1">{teacher.gender}</p>
                </div>
                <div>
                  <label className="font-medium">Nationality</label>
                  <p className="text-muted-foreground mt-1 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {teacher.nationality}
                  </p>
                </div>
                <div>
                  <label className="font-medium">Religion</label>
                  <p className="text-muted-foreground mt-1">
                    {teacher.religion}
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
                    <label className="font-medium">Primary Phone</label>
                    <p className="text-muted-foreground mt-1">
                      {teacher.phone}
                    </p>
                  </div>
                  {teacher.altPhone && (
                    <div>
                      <label className="font-medium">Alternative Phone</label>
                      <p className="text-muted-foreground mt-1">
                        {teacher.altPhone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card px-2 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs w-full overflow-hidden h-full">
          <Card className="rounded-xs p-3 gap-y-3 w-full overflow-hidden h-full">
            <CardHeader className="px-0">
              <CardTitle className="flex items-center gap-2 text-xl">
                <School className="w-5 h-5 text-red-600" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col gap-y-3 w-full overflow-x-auto">
              <div className="w-full space-y-4">
                <div className="w-full space-y-2">
                  <Badge variant="secondary" className="mx-auto flex">SSC</Badge>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="font-medium">School</label>
                      <p className="text-muted-foreground mt-1">{teacher.sscSchool}</p>
                    </div>
                    <div>
                      <label className="font-medium">Group</label>
                      <p className="text-muted-foreground mt-1">{teacher.sscGroup}</p>
                    </div>
                    <div>
                      <label className="font-medium">Result</label>
                      <p className="text-muted-foreground mt-1">{teacher.sscResult}</p>
                    </div>
                  </div>
                </div>
                <div className="w-full space-y-2">
                  <Badge variant="secondary" className="mx-auto flex">HSC</Badge>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="font-medium">College</label>
                      <p className="text-muted-foreground mt-1">{teacher.hscSchool}</p>
                    </div>
                    <div>
                      <label className="font-medium">Group</label>
                      <p className="text-muted-foreground mt-1">{teacher.hscGroup}</p>
                    </div>
                    <div>
                      <label className="font-medium">Result</label>
                      <p className="text-muted-foreground mt-1">{teacher.hscResult}</p>
                    </div>
                  </div>
                </div>
                <div className="w-full space-y-2">
                  <Badge variant="secondary" className="mx-auto flex">Graduation</Badge>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="font-medium">University</label>
                      <p className="text-muted-foreground mt-1">{teacher.degreeSchool}</p>
                    </div>
                    <div>
                      <label className="font-medium">Sbuject</label>
                      <p className="text-muted-foreground mt-1">{teacher.degreeSubject}</p>
                    </div>
                    <div>
                      <label className="font-medium">Result</label>
                      <p className="text-muted-foreground mt-1">{teacher.degreeResult}</p>
                    </div>
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
                    {teacher.presentHouseNo}, {teacher.presentMoholla}
                  </p>
                  <p className="text-muted-foreground">
                    {teacher.presentPost}, {teacher.presentThana}
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
                    {teacher.permanentVillage}
                  </p>
                  <p className="text-muted-foreground">
                    {teacher.permanentPost}, {teacher.permanentThana}
                  </p>
                  <p className="text-muted-foreground">
                    {teacher.permanentDistrict}
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
                Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col gap-y-3 w-full overflow-x-auto">
              <div>
                <label className="font-medium">Current Institution</label>
                <p className="text-muted-foreground mt-1 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {/* {teacher.currentInstitution} */}
                </p>
              </div>

              <div>
                <label className="font-medium">Teaching Levels</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {teacher.level.map((level, index) => (
                    <Badge key={index} variant="secondary">
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <label className="font-medium">Available Days</label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {teacher.availableDays.map((day, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
