import { read } from "@foreman/fs";
import { notify } from "@foreman/notify";
import * as typescript from "@foreman/typescript";
import * as config from "../config";

const service = typescript.createLanguageService();

export async function check(path: string): Promise<void> {
  const source = await read(path);
  const diagnotics = await typescript.diagnose(service, path);

  if (diagnotics.length === 0) {
    notify({
      message: "Typecheck succeeded",
      type: "success",
      desktop: false
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
