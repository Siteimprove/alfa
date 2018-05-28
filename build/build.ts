import { Task, execute } from "@foreman/api";
import { expand, remove } from "@foreman/fs";
import { notify } from "@foreman/notify";
import { Packages } from "@foreman/dependant";
import * as typescript from "./tasks/typescript";

(async () => {
  for (const path of await expand("build/**/*.ts")) {
    notify({ message: "Building", value: path });

    try {
      await execute([typescript.diagnose], path);
    } catch (error) {
      process.exit(1);
    }
  }

  const packages = new Packages({ include: "packages/*" });

  for (const pkg of await expand("packages/*")) {
    packages.add(pkg);
  }

  await packages.traverse(async pkg => {
    await remove(`${pkg}/dist`);

    for (const path of await expand(`${pkg}/src/**/*.ts`)) {
      notify({ message: "Building", value: path });

      try {
        await execute([typescript.diagnose, typescript.compile], path);
      } catch (error) {
        process.exit(1);
      }
    }

    for (const path of await expand([`${pkg}/{test,bench}/**/*.ts{,x}`])) {
      notify({ message: "Building", value: path });

      try {
        await execute([typescript.diagnose], path);
      } catch (error) {
        process.exit(1);
      }
    }
  });

  for (const path of await expand("docs/**/*.ts")) {
    notify({ message: "Building", value: path });

    try {
      await execute([typescript.diagnose], path);
    } catch (error) {
      process.exit(1);
    }
  }
})();
