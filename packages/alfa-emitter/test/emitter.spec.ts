import { test } from "@siteimprove/alfa-test";

import { Emitter } from "../src/emitter";

test(".of() constructs a new emitter", (t) => {
  t.equal(Emitter.of() instanceof Emitter, true);
  t.notEqual(Emitter.of(), Emitter.of());
});

test("#on() attaches an event listener to an emitter", (t) => {
  const emitter = Emitter.of<string>();

  const emitted: Array<string> = [];

  emitter.on((event) => {
    emitted.push(event);
  });

  emitter.emit("foo");
  emitter.emit("bar");
  emitter.emit("baz");

  t.deepEqual(emitted, ["foo", "bar", "baz"]);
});

test("#off() detaches an event listener from an emitter", (t) => {
  const emitter = Emitter.of();

  const listener = () => {};

  emitter.on(listener);

  t.equal(emitter.emit(), true);

  emitter.off(listener);

  t.equal(emitter.emit(), false);
});

test("#once() attaches an event listener that is only invoked once", (t) => {
  const emitter = Emitter.of();

  let count = 0;

  emitter.once(() => {
    count++;
  });

  t.equal(emitter.emit(), true);
  t.equal(emitter.emit(), false);

  t.equal(count, 1);
});

test("#emit() synchronously emits an event to listeners", (t) => {
  const emitter = Emitter.of();

  let emitted = false;

  emitter.on(() => {
    emitted = true;
  });

  emitter.emit();

  t.equal(emitted, true);
});

test("#emit() returns true if listeners have been registered", (t) => {
  const emitter = Emitter.of();

  emitter.on(() => {});

  t.equal(emitter.emit(), true);
});

test("#emit() returns false if no listeners have been registered", (t) => {
  const emitter = Emitter.of();

  t.equal(emitter.emit(), false);
});

test("an event listener attached using #once() can be detached using #off()", (t) => {
  const emitter = Emitter.of();

  const listener = () => {
    t.fail("listener was not detached");
  };

  emitter.once(listener).off(listener);

  t.equal(emitter.emit(), false);
});

test("#contraMap() applies a function to each value emitted by an emitter", (t) => {
  const strings = Emitter.of<string>();

  const emitted: Array<string> = [];

  strings.on((event) => {
    emitted.push(event);
  });

  strings.emit("foo");

  t.deepEqual(emitted, ["foo"]);

  const numbers = strings.contraMap<number>((number) => number.toString());

  numbers.emit(123);

  t.deepEqual(emitted, ["foo", "123"]);
});
