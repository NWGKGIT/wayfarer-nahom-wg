import type { Session } from "@wayfer-assesment/auth";
import type { Database } from "@wayfer-assesment/db";

export type Context = {
  session: Session | null;
  db: Database;
};
