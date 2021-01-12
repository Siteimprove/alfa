import { Array } from "@siteimprove/alfa-array";
import { Callback } from "@siteimprove/alfa-callback";
import { Emitter } from "@siteimprove/alfa-emitter";
import { Serializable } from "@siteimprove/alfa-json";
import { Option } from "@siteimprove/alfa-option";
import { Sequence } from "@siteimprove/alfa-sequence";

import * as json from "@siteimprove/alfa-json";

import { now } from "./now";

export class Performance
  implements AsyncIterable<Performance.Entry>, Serializable<Performance.JSON> {
  public static of(): Performance {
    return new Performance();
  }

  private readonly _epoch = now();
  private readonly _entries = Array.empty<Performance.Entry>();
  private readonly _emitter = Emitter.of<Performance.Entry>();

  private constructor() {}

  public get epoch(): number {
    return this._epoch;
  }

  public get entries(): Sequence<Performance.Entry> {
    return Sequence.from(this._entries);
  }

  public now(): number {
    return now() - this._epoch;
  }

  public elapsed(now?: number): number {
    return now ? now - this._epoch : this.now();
  }

  public mark(id: string): Performance.Entry {
    return this._store(Performance.entry(id, "mark", this.now(), 0));
  }

  public measure(
    id: string,
    start: string | number = this._epoch,
    end: string | number = this.now()
  ): Performance.Entry {
    if (typeof start === "string") {
      start = this._findLastEntry(start)
        .map((entry) => entry.start)
        .getOr(this._epoch);
    }

    if (typeof end === "string") {
      end = this._findLastEntry(end)
        .map((entry) => entry.start)
        .getOr(this.now());
    }

    return this._store(Performance.entry(id, "measure", start, end - start));
  }

  public on(listener: Callback<Performance.Entry>): void {
    this._emitter.on(listener);
  }

  public asyncIterator(): AsyncIterator<Performance.Entry> {
    return this._emitter.asyncIterator();
  }

  public [Symbol.asyncIterator](): AsyncIterator<Performance.Entry> {
    return this.asyncIterator();
  }

  public toJSON(): Performance.JSON {
    return {
      entries: this._entries.map((entry) => entry.toJSON()),
    };
  }

  private _store(entry: Performance.Entry): Performance.Entry {
    this._entries.push(entry);
    this._emitter.emit(entry);
    return entry;
  }

  private _findLastEntry(id: string): Option<Performance.Entry> {
    return Array.findLast(this._entries, (entry) => entry.id === id);
  }
}

export namespace Performance {
  export interface JSON {
    [key: string]: json.JSON;
    entries: Array<Entry.JSON>;
  }

  export class Entry implements Serializable<Entry.JSON> {
    public static of(
      id: string,
      type: string,
      start: number,
      duration: number
    ): Entry {
      return new Entry(id, type, start, duration);
    }

    private readonly _id: string;
    private readonly _type: string;
    private readonly _start: number;
    private readonly _duration: number;

    private constructor(
      id: string,
      type: string,
      start: number,
      duration: number
    ) {
      this._id = id;
      this._type = type;
      this._start = start;
      this._duration = duration;
    }

    public get id(): string {
      return this._id;
    }

    public get type(): string {
      return this._type;
    }

    public get start(): number {
      return this._start;
    }

    public get duration(): number {
      return this._duration;
    }

    public toJSON(): Entry.JSON {
      return {
        id: this._id,
        type: this._type,
        start: this._start,
        duration: this._duration,
      };
    }
  }

  export namespace Entry {
    export interface JSON {
      [key: string]: json.JSON | undefined;
      id: string;
      type: string;
      start: number;
      duration: number;
    }
  }

  export const { of: entry } = Entry;
}
