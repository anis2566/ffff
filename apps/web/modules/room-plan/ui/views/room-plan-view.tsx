"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Clock, Edit, Layers3, Warehouse } from "lucide-react";
import Link from "next/link";

import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";

export const RoomPlanView = () => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(trpc.batch.getRoomPlan.queryOptions());

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data?.roomPlan?.map((room, index) => (
        <CardWrapper key={index}>
          <div className="flex items-center justify-between gap-2 border-b border-muted p-2">
            <div className="flex items-center justify-center gap-2 w-10 h-10 rounded-full shadow-md shadow-primary">
              <Warehouse className="w-4 h-4" />
            </div>
            <h1 className="text-center text-2xl font-semibold flex-1">
              {room.roomName}
            </h1>
          </div>
          <div>
            {room.batches.map((batch, index) => (
              <div key={index} className="p-2">
                <div className="mb-2 p-2 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <p className="text-md font-semibold text-center">
                        {batch.batchTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers3 className="w-4 h-4" />
                      <p className="text-md font-semibold text-center capitalize">
                        {batch.batchName}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="icon" asChild>
                    <Link
                      href={`/batch/${batch.batchId}?redirectUrl=/dashboard/batch/plan`}
                      prefetch
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
                <div>
                  {batch.classes.map((cls, index) => (
                    <div
                      key={index}
                      className="flex justify-between p-2 rounded-md"
                    >
                      <div>
                        <p className="text-[16px]">{cls.time}</p>
                        <p className="font-semibold w-full max-w-[250px] truncate">
                          {cls.teachers.join("+")}
                        </p>
                        <p className="w-full max-w-[250px] truncate">
                          {cls.subjectName.join("+")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator
                  className={cn(index === room.batches.length - 1 && "hidden")}
                />
              </div>
            ))}
          </div>
        </CardWrapper>
      ))}
    </div>
  );
};
