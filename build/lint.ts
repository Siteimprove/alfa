import { exists } from "@foreman/fs";
import { staged, add } from "@foreman/git";
import * as prettier from "./tasks/prettier";

async function lint() {
  const files = await staged();

  for (const file of files) {
    if (await exists(file)) {
      await prettier.transform(file);
      await add(file);
    }
  }
}

lint();
