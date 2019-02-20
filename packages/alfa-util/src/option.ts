export type Some<T> = Exclude<T, null>;

export type None = null;

export type Option<T> = Some<T> | None;

export namespace Option {
  export function map<T, U>(
    option: Option<T>,
    ifSome: (value: Some<T>) => Option<U>,
    ifNone: () => Option<U> = () => null
  ): Option<T | U> {
    return option === null ? ifNone() : ifSome(option);
  }

  export function ifSome<T, U>(
    option: Option<T>,
    ifSome: (value: Some<T>) => Option<U>
  ): Option<U> {
    return option !== null ? ifSome(option) : null;
  }

  export function ifNone<T, U>(
    option: Option<T>,
    ifNone: () => Option<U>
  ): Option<T | U> {
    return option === null ? ifNone() : option;
  }
}
