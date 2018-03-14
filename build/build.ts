import { Task, execute } from "@foreman/api";
import { expand } from "@foreman/fs";
import { notify } from "@foreman/notify";
import { Packages } from "@foreman/dependant";
import * as typescript from "./tasks/typescript";
import * as locale from "./tasks/locale";

async function build(): Promise<void> {
  const packages = new Packages({ include: "packages/*" });

  for (const name of await expand("packages/*")) {
    packages.add(name);
  }

  await packages.traverse(async pkg => {
    for (const path of await expand(`${pkg}/**/*.hjson`)) {
      notify({ message: "Building", value: path, desktop: false });

      try {
        await execute([locale.transform], path);
      } catch (error) {
        process.exit(1);
      }
    }

    for (const path of await expand(`${pkg}/src/**/*.ts`)) {
      notify({ message: "Building", value: path, desktop: false });

      try {
        await execute([typescript.diagnose, typescript.compile], path);
      } catch (error) {
        process.exit(1);
      }
    }

    for (const path of await expand([`${pkg}/test/**/*.ts{,x}`])) {
      notify({ message: "Building", value: path, desktop: false });

      try {
        await execute([typescript.diagnose], path);
      } catch (error) {
        process.exit(1);
      }
    }
  });

  for (const path of await expand(["build/**/*.ts"])) {
    notify({ message: "Building", value: path, desktop: false });

    try {
      await execute([typescript.diagnose], path);
    } catch (error) {
      process.exit(1);
    }
  }
}

build();
