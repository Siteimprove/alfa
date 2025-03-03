import { Array } from "@siteimprove/alfa-array";
import { Equatable } from "@siteimprove/alfa-equatable";
import type { Hash, Hashable } from "@siteimprove/alfa-hash";

import * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";
import * as sarif from "@siteimprove/alfa-sarif";

/**
 * @public
 */
export class Group<T extends Hashable>
  implements
    Iterable<T>,
    Equatable,
    Hashable,
    json.Serializable<Group.JSON<T>>,
    earl.Serializable<Group.EARL>,
    sarif.Serializable<sarif.Location>
{
  public static of<T extends Hashable>(members: Iterable<T>): Group<T> {
    return new Group(Array.from(members));
  }

  private readonly _members: ReadonlyArray<T>;

  protected constructor(members: ReadonlyArray<T>) {
    this._members = members;
  }

  public get size(): number {
    return this._members.length;
  }

  public *[Symbol.iterator](): Iterator<T> {
    yield* this._members;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Group &&
      value._members.length === this._members.length &&
      value._members.every((member, i) =>
        Equatable.equals(member, this._members[i]),
      )
    );
  }

  public hash(hash: Hash) {
    for (const member of this._members) {
      member.hash(hash);
    }
  }

  public toJSON(options?: json.Serializable.Options): Group.JSON<T> {
    return this._members.map((member) =>
      json.Serializable.toJSON(member, options),
    );
  }

  public toEARL(): Group.EARL {
    return {
      "@context": {
        ptr: "http://www.w3.org/2009/pointers#",
      },
      "@type": ["ptr:Pointer", "ptr:PointersGroup", "ptr:RelatedPointers"],
      "ptr:groupPointer": {
        "@list": Array.collect(this._members, (member) =>
          earl.Serializable.toEARL(member),
        ),
      },
    };
  }

  public toSARIF(): sarif.Location {
    return {
      logicalLocations: Array.flatMap(this._members, (member) =>
        sarif.Serializable.toSARIF(member)
          .map(
            (location) => (location as sarif.Location).logicalLocations ?? [],
          )
          .getOr([]),
      ),
    };
  }
}

/**
 * @public
 */
export namespace Group {
  export type JSON<T> = Array<json.Serializable.ToJSON<T>>;

  export interface EARL extends earl.EARL {
    "@context": {
      ptr: "http://www.w3.org/2009/pointers#";
    };
    "@type": ["ptr:Pointer", "ptr:PointersGroup", "ptr:RelatedPointers"];
    "ptr:groupPointer": {
      "@list": Array<earl.EARL>;
    };
  }

  export function isGroup<T extends Hashable>(
    value: unknown,
  ): value is Group<T> {
    return value instanceof Group;
  }
}
