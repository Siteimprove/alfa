export type Some<T> = Exclude<T, null>;

export function Some<T>(value: Some<T>): Some<T> {
  return value;
}

export type None = typeof None;

export const None = null;

export type Option<T> = Some<T> | None;

export function Option<T>(value: Option<T>): Option<T> {
  return Option.isSome(value) ? Some(value) : None;
}

export namespace Option {
  export function isSome<T>(option: Option<T>): option is Some<T> {
    return option !== None;
  }

  export function isNone<T>(option: Option<T>): option is None {
    return option === None;
  }

  export function ifSome<T, U>(
    option: Option<T>,
    ifSome: (value: Some<T>) => Option<U>
  ): Option<U> {
    return isSome(option) ? ifSome(option) : None;
  }

  export function ifNone<T, U>(
    option: Option<T>,
    ifNone: () => Option<U>
  ): Option<T> | Option<U> {
    return isNone(option) ? ifNone() : option;
  }

  export function map<T, U = T>(
    option: Option<T>,
    ifSome: (value: Some<T>) => Option<U>,
    ifNone: () => Option<U> = () => None
  ): Option<T> | Option<U> {
    return isNone(option) ? ifNone() : ifSome(option);
  }
}
