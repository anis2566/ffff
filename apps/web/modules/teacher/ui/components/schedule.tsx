import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { BookOpen, BuildingIcon, Layers, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { DAYS } from "@workspace/utils/constant";

import { useDeleteBatchClass } from "@/hooks/use-batch-class";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";

interface ScheduleProps {
  teacherId: string;
}

export const Schedule = ({ teacherId }: ScheduleProps) => {
  const { onOpen } = useDeleteBatchClass();
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.batchClass.getByTeacher.queryOptions(teacherId)
  );

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <CardWrapper>
      <Table>
        <TableHeader>
          <TableRow className="bg-background/60">
            <TableHead>Time</TableHead>
            {Object.values(DAYS)
              .slice(0, 6)
              .map((day) => (
                <TableHead key={day}>{day}</TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((item, index) => (
            <TableRow
              key={index}
              className="even:bg-background hover:even:bg-background"
            >
              <TableCell className="border">{item.time}</TableCell>
              {Object.values(DAYS)
                .slice(0, 6)
                .map((v, i) => {
                  const isMatchDay = item.classes.find(
                    (item) => item.day === v
                  );
                  return (
                    <TableCell key={i} className="border text-center">
                      {isMatchDay ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-x-2">
                            <BookOpen className="w-4 h-4" />
                            <p className="text-lg font-semibold">
                              {isMatchDay?.subjectName}
                            </p>
                          </div>
                          <div className="flex items-center gap-x-2">
                            <Layers className="w-4 h-4" />
                            <Link
                              href={`/batch/${item.batchId}`}
                              className="text-md hover:underline"
                            >
                              {isMatchDay.batchName}
                            </Link>
                          </div>
                          <div className="flex items-center gap-x-2">
                            <BuildingIcon className="w-4 h-4" />
                            <p className="text-md">{isMatchDay.roomName}</p>
                            <Button
                              className="ml-auto"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                onOpen(isMatchDay.id, item.batchId, teacherId)
                              }
                            >
                              <Trash2 className="w-5 h-5 text-rose-600" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        "-"
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
