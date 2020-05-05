export class Time {
  public static of(epoch: number): Time {
    return new Time(epoch);
  }

  public static now(): Time {
    return this.of(Date.now());
  }

  private readonly _epoch: number;

  constructor(epoch: number) {
    this._epoch = epoch;
  }

  public get epoch(): number {
    return this._epoch;
  }

  public elapsed(now: number = Date.now()): number {
    return now - this._epoch;
  }
}
