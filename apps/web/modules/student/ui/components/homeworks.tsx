"use client";

import { Download, Loader2 } from "lucide-react";
import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";

import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";
import { useGetHomeworks } from "../../filters/use-get-homeworks";

interface HomeworksProps {
  studentId: string;
}

export const Homeworks = ({ studentId }: HomeworksProps) => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetHomeworks();

  const { data, isLoading } = useQuery(
    trpc.homework.getByStudent.queryOptions({ studentId, ...filters })
  );

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ListCardWrapper
      title="Homeworks"
      value={data?.totalCount}
      actionButtons
      actionButtonText="Export to CSV"
      actionButtonVariant="secondary"
      actionButtonIcon={Download}
      onClickAction={() => {}}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-background/60">
            <TableHead>Date</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Feedback</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.homeworks?.map((homework) => (
            <TableRow key={homework.id}>
              <TableCell>{format(homework.createdAt, "dd MMM yyyy")}</TableCell>
              <TableCell>{homework.subject.name}</TableCell>
              <TableCell>
                <Badge
                  variant={homework.hasFinished ? "default" : "destructive"}
                  className="rounded-full"
                >
                  {homework.hasFinished ? "Finished" : "Unfinished"}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[150px] truncate">
                {homework.feedback ? homework.feedback : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <DesktopPagination
        totalCount={data?.totalCount || 0}
        currentPage={filters.page}
        pageSize={5}
        onPageChange={(page) => setFilters({ page })}
      />
      <MobilePagination
        totalCount={data?.totalCount || 0}
        currentPage={filters.page}
        pageSize={5}
        onPageChange={(page) => setFilters({ page })}
      />
    </ListCardWrapper>
  );
};
