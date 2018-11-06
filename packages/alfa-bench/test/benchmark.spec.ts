import { test } from "@siteimprove/alfa-test";
import { Event } from "benchmark";
import { benchmark, Notifier, Result, Suite } from "../src/benchmark";

test("Collects stats in each cycle", t => {
  const result = new Array<Result>();
  const notifier: Notifier = {
    out: message => {
      // ignore
    }
  };
  const suite: Suite = {
    on: (title: string, emit: ({ target }: Event) => void) => {
      const event1 = new Event("Foo");
      const event2 = new Event("Bar");
      event1.target = {
        name: "Foo",
        hz: 50,
        stats: {
          deviation: 2,
          mean: 3,
          moe: 4,
          rme: 5,
          sample: [3, 5, 1],
          sem: 7,
          variance: 8
        }
      };

      event2.target = {
        name: "Bar",
        hz: 25,
        stats: {
          deviation: 2,
          mean: 3,
          moe: 4,
          rme: 5,
          sample: [7, 1, 6, 6, 1],
          sem: 7,
          variance: 8
        }
      };

      emit(event1);
      emit(event2);

      t.deepEqual(result, [
        { title: "Foo", frequency: 50, margin: 5, samples: 3 },
        { title: "Bar", frequency: 25, margin: 5, samples: 5 }
      ]);
    },
    run: () => {},
    add: (title: string, callback: () => void | Promise<void>) => suite
  };

  benchmark(suite, result, notifier);
});

test("Outputs stats in each cycle", t => {
  const result = new Array<Result>();
  const notifier: Notifier = {
    out: message => {
      t.equal(
        message,
        "\u001b[34m2\u001b[39m tests completed\n\u001b[90m├\u001b[39m \u001b[32m\u001b[4mFoo\u001b[24m\u001b[39m\u001b[90m x \u001b[39m\u001b[32m50\u001b[39m ops/sec\u001b[90m ±\u001b[39m\u001b[33m5.00\u001b[39m\u001b[34m%\u001b[39m\u001b[90m (3 runs sampled)\u001b[39m\n\u001b[90m└\u001b[39m Foo\u001b[90m x \u001b[39m\u001b[31m25\u001b[39m ops/sec\u001b[90m ±\u001b[39m\u001b[33m5.00\u001b[39m\u001b[34m%\u001b[39m\u001b[90m (5 runs sampled)\u001b[39m\n"
      );
    }
  };
  const suite: Suite = {
    on: (title: string, emit: ({ target }: Event) => void) => {
      const event1 = new Event("Foo");
      const event2 = new Event("Bar");
      event1.target = {
        name: "Foo",
        hz: 50,
        stats: {
          deviation: 2,
          mean: 3,
          moe: 4,
          rme: 5,
          sample: [3, 5, 1],
          sem: 7,
          variance: 8
        }
      };

      event2.target = {
        name: "Foo",
        hz: 25,
        stats: {
          deviation: 2,
          mean: 3,
          moe: 4,
          rme: 5,
          sample: [7, 1, 6, 6, 1],
          sem: 7,
          variance: 8
        }
      };

      emit(event1);
      emit(event2);
    },
    run: () => {},
    add: (title: string, callback: () => void | Promise<void>) => suite
  };

  benchmark(suite, result, notifier);
});
