import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { EditStudentAttendanceView } from "@/modules/attendance/ui/views/edit-student-attendance-view";

export const metadata: Metadata = {
  title: "Edit Attendance",
  description: "Edit an existing attendance",
};

interface Props {
  params: Promise<{ id: string }>;
}

const EditStudentAttendance = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.studentAttendance.getOne.queryOptions(id));

  return (
    <ContentLayout>
      <HydrateClient>
        <EditStudentAttendanceView id={id} />
      </HydrateClient>
    </ContentLayout>
  );
};

export default EditStudentAttendance;
