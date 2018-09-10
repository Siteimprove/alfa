declare module "gaze" {
  interface Watcher {
    on(event: "changed", callback: (file: string) => void): void;
    on(event: "added", callback: (file: string) => void): void;
    on(event: "deleted", callback: (file: string) => void): void;
    on(event: "all", callback: (event: string, file: string) => void): void;
  }

  function gaze(
    patterns: string | Array<string>,
    callback: (error: Error | null, watcher: Watcher) => void
  ): void;

  export = gaze;
}
