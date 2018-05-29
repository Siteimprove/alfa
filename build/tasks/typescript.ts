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

    for (const { name, text } of files) {
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
