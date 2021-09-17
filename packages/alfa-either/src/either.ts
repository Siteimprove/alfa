import { Applicative } from "@siteimprove/alfa-applicative";
import { Callback } from "@siteimprove/alfa-callback";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Foldable } from "@siteimprove/alfa-foldable";
import { Functor } from "@siteimprove/alfa-functor";
import { Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { Option } from "@siteimprove/alfa-option";
import { Reducer } from "@siteimprove/alfa-reducer";

import { Left } from "./left";
import { Right } from "./right";

/**
 * @public
 */
export interface Either<L, R = L>
  extends Functor<R>,
    Applicative<R>,
    Monad<R>,
    Foldable<R>,
    Iterable<L | R>,
    Equatable,
    Hashable,
    Serializable<Either.JSON<L, R>> {
  isLeft(): this is Left<L>;
  isRight(): this is Right<R>;
  map<T>(mapper: Mapper<R, T>): Either<L, T>;
  apply<T>(mapper: Either<L, Mapper<R, T>>): Either<L, T>;
  flatMap<T>(mapper: Mapper<R, Either<L, T>>): Either<L, T>;
  flatten<L, R>(this: Either<L, Either<L, R>>): Either<L, R>;
  reduce<T>(reducer: Reducer<R, T>, accumulator: T): T;
  either<T>(left: Mapper<L, T>, right: Mapper<R, T>): T;
  get(): L | R;
  left(): Option<L>;
  right(): Option<R>;
  teeLeft(callback: Callback<L>): Either<L, R>;
  teeRight(callback: Callback<R>): Either<L, R>;
  toJSON(): Either.JSON<L, R>;
}

/**
 * @public
 */
export namespace Either {
  export type JSON<L, R = L> = Left.JSON<L> | Right.JSON<R>;

  export function isEither<L, R>(value: Iterable<L | R>): value is Either<L, R>;

  export function isEither<L, R>(value: unknown): value is Either<L, R>;

  export function isEither<L, R>(value: unknown): value is Either<L, R> {
    return isLeft(value) || isRight(value);
  }

  export function isLeft<L>(value: Iterable<L>): value is Left<L>;

  export function isLeft<L>(value: unknown): value is Left<L>;

  export function isLeft<L>(value: unknown): value is Left<L> {
    return Left.isLeft(value);
  }

  export function isRight<R>(value: Iterable<R>): value is Right<R>;

  export function isRight<R>(value: unknown): value is Right<R>;

  export function isRight<R>(value: unknown): value is Right<R> {
    return Right.isRight(value);
  }

  export function left<L, R = never>(value: L): Either<L, R> {
    return Left.of(value);
  }

  export function right<R, L = never>(value: R): Either<L, R> {
    return Right.of(value);
  }
}
