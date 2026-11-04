import { createAuth } from "@wayfer-assesment/auth";
import { createPrismaClient } from "@wayfer-assesment/db";

import { ENV } from "./env.server";

export const db = createPrismaClient(ENV);
export const auth = createAuth(ENV, db);
