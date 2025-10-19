import { parseAsInteger, useQueryStates } from "nuqs";

import { DEFAULT_PAGE } from "@workspace/utils/constant";

export const useGetHomeworks = () => {
  return useQueryStates({
    page: parseAsInteger
      .withDefault(DEFAULT_PAGE)
      .withOptions({ clearOnDefault: true }),
  });
};
