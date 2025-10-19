"use client";

import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import { Card, CardContent } from "@workspace/ui/components/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { TEACHER_ADVANCE_STATUS } from "@workspace/utils/constant";
import { Badge } from "@workspace/ui/components/badge";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetAdvances } from "../../filters/use-get-advances";
import { Loader2 } from "lucide-react";

interface AdvancesProps {
  teacherId: string;
}

export const Advances = ({ teacherId }: AdvancesProps) => {
  const trpc = useTRPC();
  const [filter, setFilter] = useGetAdvances();

  const { data, isLoading } = useQuery(
    trpc.teacherAdvance.getByTeacher.queryOptions({
      teacherId,
      page: filter.page,
    })
  );

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card px-2 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs w-full overflow-hidden h-full">
      <Card className="rounded-xs p-3 gap-y-3 w-full overflow-hidden h-full">
        <CardContent className="p-0 flex flex-col gap-y-3 w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-background/60">
                <TableHead>Date</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.advances?.map((advance) => (
                <TableRow key={advance.id}>
                  <TableCell>
                    {format(advance.updatedAt, "dd MMM yyyy hh:mm a")}
                  </TableCell>
                  <TableCell>{advance.month}</TableCell>
                  <TableCell>{advance.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        advance.status === TEACHER_ADVANCE_STATUS.Pending
                          ? "outline"
                          : advance.status === TEACHER_ADVANCE_STATUS.Approved
                            ? "default"
                            : "destructive"
                      }
                      className="rounded-full"
                    >
                      {advance.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <DesktopPagination
            totalCount={data?.totalCount || 0}
            currentPage={filter.page}
            pageSize={5}
            onPageChange={(page) => setFilter({ page })}
          />
          <MobilePagination
            totalCount={data?.totalCount || 0}
            currentPage={filter.page}
            pageSize={5}
            onPageChange={(page) => setFilter({ page })}
          />
        </CardContent>
      </Card>
    </div>
  );
};
