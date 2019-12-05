import { Equality } from "@siteimprove/alfa-equality";
import { Foldable } from "@siteimprove/alfa-foldable";
import { Functor } from "@siteimprove/alfa-functor";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { Option } from "@siteimprove/alfa-option";
import { Reducer } from "@siteimprove/alfa-reducer";

import { Left } from "./left";
import { Right } from "./right";

export interface Either<L, R>
  extends Monad<L | R>,
    Functor<L | R>,
    Foldable<L | R>,
    Iterable<L | R>,
    Equality<Either<L, R>> {
  isLeft(): this is Left<L>;
  isRight(): this is Right<R>;
  get(): L | R;
  left(): Option<L>;
  right(): Option<R>;
  either<T>(left: Mapper<L, T>, right: Mapper<R, T>): T;
  map<T>(mapper: Mapper<L | R, T>): Either<T, T>;
  flatMap<T>(mapper: Mapper<L | R, Either<T, T>>): Either<T, T>;
  reduce<T>(reducer: Reducer<L | R, T>, accumulator: T): T;
  equals(value: unknown): value is Either<L, R>;
  toJSON(): { left: L } | { right: R };
}

export namespace Either {
  export function isEither<L, R>(value: unknown): value is Either<L, R> {
    return Left.isLeft(value) || Right.isRight(value);
  }
}
