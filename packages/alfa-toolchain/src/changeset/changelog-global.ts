import { read as readConfig } from "@changesets/config";
import getChangeSets from "@changesets/read";
import type { Config, NewChangeset } from "@changesets/types";
import { getPackages, type Packages } from "@manypkg/get-packages";

import { Changelog } from "./build-changelog";

const targetPath = process.argv[2] ?? ".";

export interface ChangelogFunctions {
  getBody(
    cwd: string,
    changesets: Array<NewChangeset>,
    packages: Packages,
    config: Config
  ): Promise<string>;
}

main();

async function main() {
  const packages = await getPackages(targetPath);
  console.dir(packages);

  const config = await readConfig(targetPath, packages);
  // console.dir(config);

  const changesets = await getChangeSets(targetPath);

  const body = await Changelog.getBody(
    targetPath,
    changesets,
    packages,
    config
  );

  console.log(body);
}
