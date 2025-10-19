import { parseAsString, useQueryStates } from "nuqs";

export const useGetSession = () => {
  return useQueryStates({
    session: parseAsString
      .withDefault("")
      .withOptions({ clearOnDefault: true }),
  });
};
