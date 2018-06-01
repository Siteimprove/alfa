import { notify } from "@foreman/notify";
import { spawn } from "@foreman/tap";

export async function test(path: string): Promise<void> {
  const { ok, assertions } = await spawn(path);

  if (assertions.length === 0) {
    notify({
      message: "No assertions run",
      type: "error"
    });

    throw new Error("No assertions run");
  }

  if (ok) {
    return notify({
      message: "Tests passed",
      type: "success"
    });
  }

  for (const { ok, error } of assertions) {
    if (ok) {
      continue;
    }

    notify({
      message: "Assertion failed",
      type: "error",
      error
    });

    throw error;
  }
}
