/**
 * @internal
 */
export type Status<T> =
  | Status.Created<T>
  | Status.Updated<T>
  | Status.Deleted<T>
  | Status.Unchanged<T>;

/**
 * @internal
 */
export namespace Status {
  abstract class Status<T> {
    protected readonly _result: T;

    protected constructor(result: T) {
      this._result = result;
    }

    public get result(): T {
      return this._result;
    }

    public abstract get status(): string;
  }

  export class Created<T> extends Status<T> {
    public static of<T>(result: T): Created<T> {
      return new Created(result);
    }

    private constructor(result: T) {
      super(result);
    }

    public get status(): "created" {
      return "created";
    }
  }

  export const { of: created } = Created;

  export class Updated<T> extends Status<T> {
    public static of<T>(result: T): Updated<T> {
      return new Updated(result);
    }

    private constructor(result: T) {
      super(result);
    }

    public get status(): "updated" {
      return "updated";
    }
  }

  export const { of: updated } = Updated;

  export class Deleted<T> extends Status<T> {
    public static of<T>(result: T): Deleted<T> {
      return new Deleted(result);
    }

    private constructor(result: T) {
      super(result);
    }

    public get status(): "deleted" {
      return "deleted";
    }
  }

  export const { of: deleted } = Deleted;

  export class Unchanged<T> extends Status<T> {
    public static of<T>(result: T): Unchanged<T> {
      return new Unchanged(result);
    }

    private constructor(result: T) {
      super(result);
    }

    public get status(): "unchanged" {
      return "unchanged";
    }
  }

  export const { of: unchanged } = Unchanged;
}
