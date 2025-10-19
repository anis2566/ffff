import { parseAsString, createLoader } from "nuqs/server";

const filterParmas = {
  session: parseAsString.withDefault("").withOptions({ clearOnDefault: true })
};

export const getSessions = createLoader(filterParmas);
