import * as inspector from "inspector";

export namespace Profiler {
  const session = new inspector.Session();

  session.connect();

  const cpu = new Promise<void>((resolve) =>
    session.post("Profiler.enable", () => resolve())
  );

  const heap = new Promise<void>((resolve) =>
    session.post("HeapProfiler.enable", () => resolve())
  );

  export namespace CPU {
    export type Profile = inspector.Profiler.Profile;

    export async function start(): Promise<void> {
      await cpu;

      return new Promise<void>((resolve) =>
        session.post("Profiler.start", () => resolve())
      );
    }

    export async function stop(): Promise<Profile> {
      await cpu;

      return new Promise<Profile>((resolve, reject) =>
        session.post("Profiler.stop", (err, { profile }) =>
          err ? reject(err) : resolve(profile)
        )
      );
    }
  }

  export namespace Heap {
    export type Profile = inspector.HeapProfiler.SamplingHeapProfile;

    export async function start(): Promise<void> {
      await heap;

      return new Promise<void>((resolve) =>
        session.post("HeapProfiler.startSampling", () => resolve())
      );
    }

    export async function stop(): Promise<Profile> {
      await heap;

      return new Promise<Profile>((resolve, reject) =>
        session.post("HeapProfiler.stopSampling", (err, { profile }) =>
          err ? reject(err) : resolve(profile)
        )
      );
    }
  }
}
