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
  extends Functor<L | R>,
    Monad<L | R>,
    Foldable<L | R>,
    Iterable<L | R>,
    Equatable,
    Hashable,
    Serializable<Either.JSON<L, R>> {
  isLeft(): this is Left<L>;
  isRight(): this is Right<R>;
  map<T>(mapper: Mapper<L | R, T>): Either<T, T>;
  flatMap<T>(mapper: Mapper<L | R, Either<T, T>>): Either<T, T>;
  reduce<T>(reducer: Reducer<L | R, T>, accumulator: T): T;
  either<T>(left: Mapper<L, T>, right: Mapper<R, T>): T;
  get(): L | R;
  left(): Option<L>;
  right(): Option<R>;
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
    return Left.isLeft(value) || Right.isRight(value);
  }

  export function left<L, R = never>(value: L): Either<L, R> {
    return Left.of(value);
  }

  export function right<R, L = never>(value: R): Either<L, R> {
    return Right.of(value);
  }
}
