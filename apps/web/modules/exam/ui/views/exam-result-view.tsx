"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { UserRoundCheck, UserRoundX, UsersRound } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";
import { EditResultsForm } from "../form/edit-results-form";

interface ExamResultViewProps {
  id: string;
}

export const ExamResultView = ({ id }: ExamResultViewProps) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(trpc.examResult.getOne.queryOptions(id));

  return (
    <div className="space-y-6">
      <CardWrapper contentClassName="space-y-4">
        <div>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="border-l-4 border-blue-500 pl-4 py-1">
                <p className="text-sm font-medium mb-1">Exam</p>
                <p className="text-md font-semibold text-muted-foreground">
                  {data?.exam?.name}
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 py-1">
                <p className="text-sm font-medium mb-1">Subject</p>
                <p className="text-md font-semibold text-muted-foreground">
                  {data?.subject?.name}
                </p>
              </div>
              <div className="border-l-4 border-blue-500  pl-4 py-1">
                <p className="text-sm font-medium mb-1">Batch</p>
                <p className="text-md font-semibold text-muted-foreground">
                  {data?.batch?.name}
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
            <span>Attended</span>
            <span className="font-bold">{data?.attended}</span>
          </Badge>
          <Badge
            variant="secondary"
            className={`px-3 py-1 font-medium rounded-full text-rose-500`}
          >
            <UserRoundX className="w-3 h-3 " />
            <span>Absent</span>
            <span className="font-bold">{data?.absent}</span>
          </Badge>
        </div>
      </CardWrapper>

      <EditResultsForm
        resultId={id}
        results={data?.examResults || []}
        hasCq={(data?.exam?.cq || 0) > 0}
        hasMcq={(data?.exam?.mcq || 0) > 0}
        hasWritten={(data?.exam?.written || 0) > 0}
        maxCqValue={data?.exam.cq || 0}
        maxMcqValue={data?.exam.mcq || 0}
        maxWrittenValue={data?.exam.written || 0}
      />
    </div>
  );
};
