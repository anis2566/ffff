import { parseAsString, createLoader } from "nuqs/server";

const filterParmas = {
  session: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  date: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
};

export const getDailyReports = createLoader(filterParmas);
