import { Profiler, Session } from "inspector";

import { Callback } from "@siteimprove/alfa-callback";
import { Thunk } from "@siteimprove/alfa-thunk";

export async function profile<T>(
  work: Thunk<Promise<T>>,
  done: Callback<Profiler.Profile>
): Promise<T> {
  const session = new Session();

  session.connect();

  return new Promise((resolve, reject) =>
    session.post("Profiler.enable", () =>
      session.post("Profiler.start", async () => {
        const value = await work();

        session.post("Profiler.stop", (err, { profile }) => {
          if (err) {
            reject(err);
          } else {
            done(profile);
            resolve(value);
          }
        });
      })
    )
  );
}
