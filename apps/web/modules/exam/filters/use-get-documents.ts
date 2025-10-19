import { parseAsString, parseAsInteger, useQueryStates } from "nuqs";

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@workspace/utils/constant";

export const useGetDocuments = () => {
  return useQueryStates({
    date: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    type: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    classNameId: parseAsString
      .withDefault("")
      .withOptions({ clearOnDefault: true }),
    subjectId: parseAsString
      .withDefault("")
      .withOptions({ clearOnDefault: true }),
    hasReceived: parseAsString
      .withDefault("")
      .withOptions({ clearOnDefault: true }),
    hasFinished: parseAsString
      .withDefault("")
      .withOptions({ clearOnDefault: true }),
    hasPrinted: parseAsString
      .withDefault("")
      .withOptions({ clearOnDefault: true }),
    page: parseAsInteger
      .withDefault(DEFAULT_PAGE)
      .withOptions({ clearOnDefault: true }),
    limit: parseAsInteger
      .withDefault(DEFAULT_PAGE_SIZE)
      .withOptions({ clearOnDefault: true }),
    sort: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  });
};
