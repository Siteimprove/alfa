import { notify } from "@foreman/notify";
import { spawn } from "@foreman/tap";

export async function test(path: string): Promise<void> {
  const { ok, children } = await spawn(path, {
    loader: "./build/config/environment.js"
  });

  if (ok) {
    return notify({
      message: "Tests passed",
      type: "success",
      desktop: false
    });
  }

  for (const { name, ok, assertions } of children) {
    for (const { ok, error } of assertions) {
      if (ok) {
        continue;
      }

      notify({
        message: `Test ${ok ? "passed" : "failed"}`,
        value: name,
        type: ok ? "success" : "error",
        desktop: !ok,
        error
      });

      throw error;
    }
  }
}
