import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@wayfer-assesment/api/routers/index";
import { NextRequest } from "next/server";

import { createContext } from "../../../../context";

function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
  });
}
export { handler as GET, handler as POST };
