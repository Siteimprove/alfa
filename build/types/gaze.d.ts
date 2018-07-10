declare module "gaze" {
  export interface Watcher {
    on(event: "changed", callback: (file: string) => void): void;
    on(event: "added", callback: (file: string) => void): void;
    on(event: "deleted", callback: (file: string) => void): void;
    on(event: "all", callback: (event: string, file: string) => void): void;
  }

  export default function(
    patterns: string | Array<string>,
    callback: (error: Error | null, watcher: Watcher) => void
  ): void;
}
