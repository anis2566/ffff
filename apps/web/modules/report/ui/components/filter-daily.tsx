"use client";

import { FilterSelect } from "@workspace/ui/shared/filter-select";
import { FilterCalendar } from "@workspace/ui/shared/filter-calendar";
import { ResetFilter } from "@workspace/ui/shared/reset-filter";
import { Session } from "@workspace/utils/constant";

import { useGetDailyReports } from "../../filters/use-get-daily-reports";

export const FilterDaily = () => {
  const [filter, setFilter] = useGetDailyReports();

  const hasAnyModified = !!filter.session || !!filter.date;

  const handleClear = () => {
    setFilter({
      session: "",
      date: "",
    });
  };

  // Convert string date to Date object for FilterCalendar
  const selectedDate = filter.date ? new Date(filter.date) : undefined;

  const handleDateChange = (date: Date | undefined) => {
    setFilter({
      date: date ? date.toISOString() : "", // or date.toDateString() depending on your needs
    });
  };

  return (
    <div className="flex-1 flex items-center justify-between gap-x-3 mb-4">
      <div className="flex-1 flex items-center gap-2">
        <FilterCalendar
          value={selectedDate}
          onChange={handleDateChange}
          placeholder="Select date"
          showInMobile={false}
          disableFuture={true}
        />
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
