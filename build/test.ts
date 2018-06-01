import { Task, execute } from "@foreman/api";
import { expand } from "@foreman/fs";
import { notify } from "@foreman/notify";
import * as tap from "./tasks/tap";
import * as typescript from "./tasks/typescript";

(async () => {
  const paths = await expand(["packages/**/test/**/*.spec.ts{,x}"]);

  for (const path of paths) {
    notify({
      message: "Testing",
      value: path
    });

    const tasks: Array<Task> = [typescript.diagnose, tap.test];

    try {
      await execute(tasks, path);
    } catch (error) {
      process.exit(1);
    }
  }
})();
