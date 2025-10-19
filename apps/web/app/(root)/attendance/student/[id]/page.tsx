import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { StudentAttendanceView } from "@/modules/attendance/ui/views/student-attendance-view";

export const metadata: Metadata = {
  title: "Attendance Details",
  description: "View details of an existing attendance",
};

interface Props {
  params: Promise<{ id: string }>;
}

const StudentAttendance = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.studentAttendance.getOne.queryOptions(id));

  return (
    <ContentLayout>
      <HydrateClient>
        <StudentAttendanceView id={id} />
      </HydrateClient>
    </ContentLayout>
  );
};

export default StudentAttendance;
