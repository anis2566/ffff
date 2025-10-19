"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";
import { format } from "date-fns";
import { UserRoundCheck, UserRoundX, UsersRound } from "lucide-react";
import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";

interface HomeworkViewProps {
  id: string;
}

export const HomeworkView = ({ id }: HomeworkViewProps) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(trpc.homework.getOne.queryOptions({ id }));

  return (
    <div className="space-y-6">
      <CardWrapper contentClassName="space-y-4">
        <div>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="border-l-4 border-blue-500 pl-4 py-1">
                <p className="text-sm font-medium mb-1">Class</p>
                <p className="text-md font-semibold text-muted-foreground">
                  {data?.className?.name}
                </p>
              </div>
              <div className="border-l-4 border-emerald-500 pl-4 py-1">
                <p className="text-sm font-medium mb-1">Batch</p>
                <p className="text-md font-semibold text-muted-foreground">
                  {data?.batch?.name}
                </p>
              </div>
              <div className="border-l-4 border-amber-500 pl-4 py-1">
                <p className="text-sm font-medium mb-1">Date</p>
                <p className="text-md font-semibold text-muted-foreground">
                  {format(new Date(data?.date || new Date()), "dd-MM-yyyy")}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="secondary"
            className={`px-3 py-1 font-medium rounded-full`}
          >
            <UsersRound className="w-3 h-3" />
            <span>Total</span>
            <span className="font-bold">{data?.total}</span>
          </Badge>
          <Badge
            variant="secondary"
            className={`px-3 py-1 font-medium rounded-full text-green-500`}
          >
            <UserRoundCheck className="w-3 h-3" />
            <span>Finished</span>
            <span className="font-bold">{data?.finished}</span>
          </Badge>
          <Badge
            variant="secondary"
            className={`px-3 py-1 font-medium rounded-full text-rose-500`}
          >
            <UserRoundX className="w-3 h-3 " />
            <span>Not Finished</span>
            <span className="font-bold">{data?.unfinished}</span>
          </Badge>
        </div>
      </CardWrapper>

      <ListCardWrapper title="Students" value={data?.homeworks?.length}>
        <Table>
          <TableHeader>
            <TableRow className="bg-background/60">
              <TableHead>#SL</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.homeworks?.map((homework, index) => (
              <TableRow key={homework.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{homework.student.studentId}</TableCell>
                <TableCell>{homework.student.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={homework.hasFinished ? "default" : "destructive"}
                    className="capitalize rounded-full"
                  >
                    {homework.hasFinished ? "Finished" : "Not Finished"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ListCardWrapper>
    </div>
  );
};
