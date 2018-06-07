import { read, write } from "@foreman/fs";
import { notify } from "@foreman/notify";
import * as prettier from "@foreman/prettier";

export async function transform(path: string): Promise<boolean> {
  const source = await read(path);

  try {
    if (await prettier.isSupported(path)) {
      const { code } = prettier.transform(source, {
        filepath: path
      });

      if (source !== code) {
        await write(path, code);

        notify({
          message: "Linting succeeded",
          type: "success"
        });

        return true;
      }
    }

    notify({
      message: "Linting skipped",
      type: "skip"
    });
  } catch (error) {
    notify({
      message: "Linting failed",
      type: "error",
      error
    });

    throw error;
  }

  return false;
}
