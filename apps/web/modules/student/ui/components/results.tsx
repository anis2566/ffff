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

import { useGetResults } from "../../filters/use-get-results";

interface ResultsProps {
  studentId: string;
}

export const Results = ({ studentId }: ResultsProps) => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetResults();

  const { data, isLoading } = useQuery(
    trpc.examResult.getByStudent.queryOptions({ studentId, ...filters })
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
      title="Results"
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
            <TableHead>Exam</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Obtain</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Merit</TableHead>
            <TableHead>Feedback</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.results?.map((result) => (
            <TableRow key={result.id}>
              <TableCell>{result.exam.name}</TableCell>
              <TableCell>{result.exam.examCategory.name}</TableCell>
              <TableCell>{result.exam.subject.name}</TableCell>
              <TableCell>{format(result.exam.date, "dd MMM yyyy")}</TableCell>
              <TableCell>
                <Badge
                  variant={result.attended ? "default" : "destructive"}
                  className="rounded-full"
                >
                  {result.attended ? "Present" : "Absent"}
                </Badge>
              </TableCell>
              <TableCell>{result.exam.total}</TableCell>
              <TableCell>{result.totalMarks}</TableCell>
              <TableCell>
                <Badge variant="secondary">{result.grade || "-"}</Badge>
              </TableCell>
              <TableCell>{result.merit ? result.merit : "-"}</TableCell>
              <TableCell className="max-w-[150px] truncate">
                {result.remarks ? result.remarks : "-"}
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
