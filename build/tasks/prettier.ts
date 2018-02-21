import { read, write } from "@foreman/fs";
import { extension } from "@foreman/path";
import { notify } from "@foreman/notify";
import * as prettier from "@foreman/prettier";

export async function transform(path: string): Promise<void> {
  const source = await read(path);
  try {
    if (prettier.isSupported(path)) {
      const code = await prettier.transform(source, {
        filepath: path
      });

      if (source !== code) {
        await write(path, code);
        return notify({
          message: "Linting succeeded",
          value: path,
          type: "success",
          desktop: false
        });
      }
    }

    notify({
      message: "Linting skipped",
      desktop: false
    });
  } catch (error) {
    notify({
      message: "Linting failed",
      type: "error",
      error
    });

    throw error;
  }
}
