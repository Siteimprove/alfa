import { Callback } from "@siteimprove/alfa-callback";
import { Emitter } from "@siteimprove/alfa-emitter";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

import { now } from "./now";

export class Performance<T>
  implements
    AsyncIterable<Performance.Entry<T>>,
    Serializable<Performance.JSON> {
  public static of<T = string>(): Performance<T> {
    return new Performance();
  }

  private readonly _epoch = now();
  private readonly _emitter = Emitter.of<Performance.Entry<T>>();

  private constructor() {}

  public get epoch(): number {
    return this._epoch;
  }

  public now(): number {
    return now() - this._epoch;
  }

  public elapsed(now?: number): number {
    return now ? now - this._epoch : this.now();
  }

  public mark(
    data: T,
    start: Performance.Entry<T> | number = this.now()
  ): Performance.Mark<T> {
    if (typeof start !== "number") {
      start = start.start;
    }

    return this._emit(Performance.mark(data, start));
  }

  public measure(
    data: T,
    start: Performance.Entry<T> | number = this._epoch,
    end: Performance.Entry<T> | number = this.now()
  ): Performance.Measure<T> {
    if (typeof start !== "number") {
      start = start.start;
    }

    if (typeof end !== "number") {
      end = end.start;
    }

    return this._emit(Performance.measure(data, start, end - start));
  }

  public on(listener: Callback<Performance.Entry<T>>): void {
    this._emitter.on(listener);
  }

  public once(): Promise<Performance.Entry<T>>;

  public once(listener: Callback<Performance.Entry<T>>): void;

  public once(
    listener?: Callback<Performance.Entry<T>>
  ): void | Promise<Performance.Entry<T>> {
    if (listener) {
      return this._emitter.once(listener);
    } else {
      return this._emitter.once();
    }
  }

  public off(listener: Callback<Performance.Entry<T>>): void {
    this._emitter.off(listener);
  }

  public asyncIterator(): AsyncIterator<Performance.Entry<T>> {
    return this._emitter.asyncIterator();
  }

  public [Symbol.asyncIterator](): AsyncIterator<Performance.Entry<T>> {
    return this.asyncIterator();
  }

  public toJSON(): Performance.JSON {
    return {};
  }

  private _emit<E extends Performance.Entry<T>>(entry: E): E {
    this._emitter.emit(entry);
    return entry;
  }
}

export namespace Performance {
  export interface JSON {
    [key: string]: json.JSON;
  }

  export function isPerformance<T>(value: unknown): value is Performance<T> {
    return value instanceof Performance;
  }

  export type Entry<T> = Mark<T> | Measure<T>;

  export namespace Entry {
    export type JSON<T> = Mark.JSON<T> | Measure.JSON<T>;
  }

  export class Mark<T> implements Serializable<Mark.JSON<T>> {
    public static of<T>(data: T, start: number): Mark<T> {
      return new Mark(data, start);
    }

    private readonly _data: T;
    private readonly _start: number;

    private constructor(data: T, start: number) {
      this._data = data;
      this._start = start;
    }

    public get type(): "mark" {
      return "mark";
    }

    public get data(): T {
      return this._data;
    }

    public get start(): number {
      return this._start;
    }

    public toJSON(): Mark.JSON<T> {
      return {
        type: "mark",
        data: Serializable.toJSON(this._data),
        start: this._start,
      };
    }
  }

  export namespace Mark {
    export interface JSON<T> {
      [key: string]: json.JSON | undefined;
      type: "mark";
      data: Serializable.ToJSON<T>;
      start: number;
    }

    export function isMark<T>(value: unknown | Entry<T>): value is Mark<T> {
      return value instanceof Mark;
    }
  }

  export const { of: mark, isMark } = Mark;

  export class Measure<T> implements Serializable<Measure.JSON<T>> {
    public static of<T>(data: T, start: number, duration: number): Measure<T> {
      return new Measure(data, start, duration);
    }

    private readonly _data: T;
    private readonly _start: number;
    private readonly _duration: number;

    private constructor(data: T, start: number, duration: number) {
      this._data = data;
      this._start = start;
      this._duration = duration;
    }

    public get type(): "measure" {
      return "measure";
    }

    public get data(): T {
      return this._data;
    }

    public get start(): number {
      return this._start;
    }

    public get duration(): number {
      return this._duration;
    }

    public toJSON(): Measure.JSON<T> {
      return {
        type: "measure",
        data: Serializable.toJSON(this._data),
        start: this._start,
        duration: this._duration,
      };
    }
  }

  export namespace Measure {
    export interface JSON<T> {
      [key: string]: json.JSON | undefined;
      type: "measure";
      data: Serializable.ToJSON<T>;
      start: number;
      duration: number;
    }

    export function isMeasure<T>(
      value: unknown | Entry<T>
    ): value is Measure<T> {
      return value instanceof Measure;
    }
  }

  export const { of: measure, isMeasure } = Measure;
}
