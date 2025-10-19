import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getStudentAttendances } from "@/modules/attendance/filters/get-student-attendances";
import { StudentAttendancesView } from "@/modules/attendance/ui/views/student-attendances-view";

export const metadata: Metadata = {
  title: "Student Attendance",
  description: "List of student attendance",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const StudentAttendances = async ({ searchParams }: Props) => {
  const params = await getStudentAttendances(searchParams);

  prefetch(trpc.studentAttendance.getMany.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <StudentAttendancesView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default StudentAttendances;
