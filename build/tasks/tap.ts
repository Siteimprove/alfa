import { notify } from "@foreman/notify";
import { spawn } from "@foreman/tap";

export async function test(path: string): Promise<void> {
  const { ok, assertions } = await spawn(path);

  if (ok) {
    return notify({
      message: "Tests passed",
      type: "success",
      desktop: false
    });
  }

  for (const { ok, error } of assertions) {
    if (ok) {
      continue;
    }

    notify({
      message: `Assertion failed`,
      type: "error",
      error
    });

    throw error;
  }
}
