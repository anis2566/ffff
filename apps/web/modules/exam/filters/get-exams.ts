import { parseAsString, parseAsInteger, createLoader } from "nuqs/server";

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@workspace/utils/constant";

const filterParmas = {
  date: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  classNameId: parseAsString
    .withDefault("")
    .withOptions({ clearOnDefault: true }),
  batchId: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  subjectId: parseAsString
    .withDefault("")
    .withOptions({ clearOnDefault: true }),
  categoryId: parseAsString
    .withDefault("")
    .withOptions({ clearOnDefault: true }),
  page: parseAsInteger
    .withDefault(DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  limit: parseAsInteger
    .withDefault(DEFAULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),
  sort: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
};

export const getExams = createLoader(filterParmas);
