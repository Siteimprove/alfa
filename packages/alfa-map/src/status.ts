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

  export function created<T>(result: T): Created<T> {
    return Created.of(result);
  }

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

  export function updated<T>(result: T): Updated<T> {
    return Updated.of(result);
  }

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

  export function deleted<T>(result: T): Deleted<T> {
    return Deleted.of(result);
  }

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

  export function unchanged<T>(result: T): Unchanged<T> {
    return Unchanged.of(result);
  }
}
