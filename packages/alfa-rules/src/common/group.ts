import { Equatable } from "@siteimprove/alfa-equatable";

import * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";

export class Group<T extends earl.Serializable>
  implements Iterable<T>, Equatable, json.Serializable, earl.Serializable {
  public static of<T extends earl.Serializable>(
    members: Iterable<T>
  ): Group<T> {
    return new Group(Array.from(members));
  }

  private readonly _members: Array<T>;

  private constructor(members: Array<T>) {
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
        Equatable.equals(member, this._members[i])
      )
    );
  }

  public toJSON(): Group.JSON {
    return this._members.map(json.Serializable.toJSON);
  }

  public toEARL(): Group.EARL {
    return {
      "@context": {
        ptr: "http://www.w3.org/2009/pointers#",
      },
      "@type": ["ptr:Pointer", "ptr:PointersGroup", "ptr:RelatedPointers"],
      "ptr:groupPointer": {
        "@list": this._members.map((member) => member.toEARL()),
      },
    };
  }
}

export namespace Group {
  export type JSON = Array<json.JSON>;

  export interface EARL extends earl.EARL {
    "@context": {
      ptr: "http://www.w3.org/2009/pointers#";
    };
    "@type": ["ptr:Pointer", "ptr:PointersGroup", "ptr:RelatedPointers"];
    "ptr:groupPointer": {
      "@list": Array<earl.EARL>;
    };
  }
}
