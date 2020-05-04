import { Time } from "./time";

export class Timeout {
  public static of(timeout: number, time: Time = Time.now()): Timeout {
    return new Timeout(timeout, time);
  }

  private readonly _timeout: number;
  private readonly _time: Time;

  private constructor(timeout: number, time: Time) {
    this._timeout = timeout;
    this._time = time;
  }

  public get timeout(): number {
    return this._timeout;
  }

  public get time(): Time {
    return this._time;
  }

  public reset(time: Time = Time.now()): Timeout {
    return new Timeout(this._timeout, time);
  }

  public elapsed(now: number = Date.now()): number {
    return this._time.elapsed(now);
  }

  public remaining(now: number = Date.now()): number {
    return this._timeout - this.elapsed(now);
  }
}
