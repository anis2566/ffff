import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { NewStudentAttendanceView } from "@/modules/attendance/ui/views/new-student-attendance-view";

export const metadata: Metadata = {
  title: "New Attendance",
  description: "Assign attendance to the system",
};

const NewAttendance = () => {
  return (
    <ContentLayout>
      <NewStudentAttendanceView />
    </ContentLayout>
  );
};

export default NewAttendance;
