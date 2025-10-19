import { parseAsString, parseAsInteger, createLoader } from "nuqs/server";

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@workspace/utils/constant";

const filterParmas = {
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  session: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  className: parseAsString
    .withDefault("")
    .withOptions({ clearOnDefault: true }),
  id: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  page: parseAsInteger
    .withDefault(DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  limit: parseAsInteger
    .withDefault(DEFAULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),
  sort: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
};

export const getStudents = createLoader(filterParmas);
