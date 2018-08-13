declare module "caniuse-api" {
  export function isSupported(
    feature: string,
    browsers?: string | Array<string>
  ): boolean;
}
