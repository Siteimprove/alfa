import { write } from "@foreman/fs";
import { notify } from "@foreman/notify";
import * as typescript from "@foreman/typescript";
import { Workspace } from "@foreman/typescript";
import { isBench, isTest } from "../guards";

const Workspaces = {
  Bench: new Workspace(),
  Src: new Workspace(),
  Test: new Workspace()
};

function workspaceFor(path: string): Workspace {
  if (isBench(path)) {
    return Workspaces.Bench;
  }

  if (isTest(path)) {
    return Workspaces.Test;
  }

  return Workspaces.Src;
}

export async function diagnose(path: string): Promise<void> {
  const diagnotics = await typescript.diagnose(workspaceFor(path), path);

  if (diagnotics.length === 0) {
    notify({
      message: "Typecheck succeeded",
      type: "success"
    });
  } else {
    const [error] = diagnotics;

    notify({
      message: "Typecheck failed",
      type: "error",
      error
    });

    throw error;
  }
}

export async function compile(path: string): Promise<void> {
  try {
    const files = await typescript.compile(workspaceFor(path), path);

    for (let { name, text } of files) {
      // The TypeScript compiler is hell-bent on ensuring that EVERY output file
      // maps to a path in the output directory. For this reason, whenever a
      // file outside the specified root directory enters a compilation unit,
      // the compiler simply changes the root directory in order to be able to
      // map the file to the output directory. When this happens, a file at
      // `src/foo.ts` will no longer be output to `dist/foo.ts` but rather
      // `dist/src/foo.ts` which is obviously not what we want. Let's fix that.
      name = name.replace(/dist\/src/, "dist");

      await write(name, text);
    }

    notify({
      message: "Compilation succeeded",
      type: "success"
    });
  } catch (error) {
    notify({
      message: "Compilation failed",
      type: "error",
      error
    });

    throw error;
  }
}
