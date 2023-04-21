import { Option } from "./option";

/**
 * @remarks
 * Should only be used when it's not possible or practical to use `Option<T>`
 *
 * @internal
 */
export type Maybe<T> = T | Option<T>;

/**
 * @internal
 */
export namespace Maybe {
  export function toOption<T>(maybe: Maybe<T>): Option<T> {
    return Option.isOption(maybe) ? maybe : Option.of(maybe);
  }
}
