"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/react";
import { useCallback } from "react";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";

import { useGetRooms } from "../../filters/use-get-rooms";
import { RoomList } from "../components/room-list";
import { Filter } from "../components/filter";
import { useCreateRoom } from "@/hooks/use-room";

export const RoomsView = () => {
  const [filters, setFilters] = useGetRooms();
  const trpc = useTRPC();
  const { onOpen } = useCreateRoom();

  const { data } = useSuspenseQuery(
    trpc.room.getMany.queryOptions({
      ...filters,
    })
  );

  const { rooms = [], totalCount = 0 } = data;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <div className="flex-1 flex flex-col gap-6">
      <ListCardWrapper
        title="Manage Room"
        value={totalCount}
        actionButtons
        onClickAction={onOpen}
      >
        <Filter />
        <RoomList rooms={rooms} />
        <DesktopPagination
          totalCount={totalCount}
          currentPage={filters.page}
          pageSize={filters.limit}
          onPageChange={handlePageChange}
        />
        <MobilePagination
          totalCount={totalCount}
          currentPage={filters.page}
          pageSize={filters.limit}
          onPageChange={handlePageChange}
        />
      </ListCardWrapper>
    </div>
  );
};
