import { parseAsString, useQueryStates } from "nuqs";

export const useGetDailyReports = () => {
  return useQueryStates({
    session: parseAsString
      .withDefault("")
      .withOptions({ clearOnDefault: true }),
    date: parseAsString
      .withDefault("")
      .withOptions({ clearOnDefault: true })
  })
};
