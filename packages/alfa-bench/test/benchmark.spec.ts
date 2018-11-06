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
        message.replace(
          /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
          ""
        ),
        "2 tests completed\n├ Foo x 50 ops/sec ±5.00% (3 runs sampled)\n└ Foo x 25 ops/sec ±5.00% (5 runs sampled)\n"
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
