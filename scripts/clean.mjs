import { system } from "./common/system.mjs";
import { flags } from "./common/flags.mjs";
import { builder } from "./common/builder.mjs";

system.exit(builder.clean(flags.project));
