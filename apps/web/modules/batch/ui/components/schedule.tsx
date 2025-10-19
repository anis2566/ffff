"use client";

import {
  BookOpen,
  BuildingIcon,
  Loader2,
  PlusCircle,
  Trash2,
  UserPen,
} from "lucide-react";
import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { cn } from "@workspace/ui/lib/utils";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";

import { useCreateBatchClass, useCreateBatchClasses } from "@/hooks/use-batch";
import { useDeleteBatchClass } from "@/hooks/use-batch-class";

interface ScheduleProps {
  batchId: string;
  batchTimes: string[];
  level: string;
}

export const Schedule = ({ batchId, batchTimes, level }: ScheduleProps) => {
  const { onOpen } = useCreateBatchClasses();
  const { onOpen: onEdit } = useCreateBatchClass();
  const { onOpen: onDelete } = useDeleteBatchClass();
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.batchClass.getByBatch.queryOptions(batchId)
  );

  console.log(batchTimes, level, batchId)

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <CardWrapper>
      <Button
        onClick={() => onOpen(batchTimes, level, batchId)}
        className="ml-auto flex rounded-full"
      >
        <PlusCircle className="h-4 w-4" />
        Add Many
      </Button>

      <Table>
        <TableHeader>
          <TableRow className="bg-background/60">
            <TableHead className="border">Day</TableHead>
            {batchTimes.map((time) => (
              <TableHead key={time} className="border">
                {time}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((item, index) => (
            <TableRow
              key={index}
              className="even:bg-background hover:even:bg-background"
            >
              <TableCell className="border">{item.day}</TableCell>
              {batchTimes.map((v, i) => {
                const isMatchedTime = item.classes.find(
                  (item) => item.time === v
                );
                return (
                  <TableCell key={i} className="border text-center">
                    {isMatchedTime ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-x-2">
                          <BookOpen className="w-5 h-5" />
                          <p className="text-lg font-semibold">
                            {isMatchedTime?.subjectName}
                          </p>
                        </div>
                        <div className="flex items-center gap-x-2">
                          <UserPen className="w-5 h-5" />
                          <Link
                            href={`/dashboard/teacher/${isMatchedTime.teacherId}`}
                            className="text-md hover:underline"
                          >
                            {isMatchedTime?.teacherName}
                          </Link>
                        </div>
                        <div className="flex items-center gap-x-2">
                          <BuildingIcon className="w-5 h-5" />
                          <p className="text-md">{isMatchedTime.roomName}</p>
                          <Button
                            className={cn("ml-auto")}
                            variant="secondary"
                            size="icon"
                            onClick={() => onDelete(isMatchedTime.id, batchId)}
                          >
                            <Trash2 className="w-5 h-5 text-rose-600" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(v, item.day, level, batchId)} // Use 'v' instead of 'item.time'
                        >
                          <PlusCircle className="text-green-600" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardWrapper>
  );
};
