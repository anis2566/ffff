"use client";

import { FilterSelect } from "@workspace/ui/shared/filter-select";
import { ResetFilter } from "@workspace/ui/shared/reset-filter";
import { Session } from "@workspace/utils/constant";

import { useGetSession } from "../../filters/use-get-session";

export const Filter = () => {
  const [filter, setFilter] = useGetSession();

  const hasAnyModified = !!filter.session;

  const handleClear = () => {
    setFilter({
      session: "",
    });
  };

  return (
    <div className="flex-1 flex items-center justify-between gap-x-3 mb-4">
      <div className="flex-1 flex items-center gap-2">
        <FilterSelect
          value={filter.session}
          onChange={(value: string) => setFilter({ session: value })}
          placeholder="Session"
          options={Session}
          className="max-w-[130px]"
        />
      </div>
      <div className="flex items-center gap-x-2">
        <ResetFilter hasModified={hasAnyModified} handleReset={handleClear} />
      </div>
    </div>
  );
};
