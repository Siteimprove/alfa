declare module "caniuse-api" {
  export function isSupported(
    feature: string,
    browsers?: string | ReadonlyArray<string>
  ): boolean;
}
