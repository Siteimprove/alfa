import { test } from "@siteimprove/alfa-test";
import { benchmark, Event, Printer, Result, Suite } from "../src/benchmark";

test("Collects stats in each cycle", t => {
  const result = new Array<Result>();
  const printer: Printer = {
    print: message => {
      // ignore
    }
  };
  const suite: Suite = {
    on: (title: string, emit: ({ target }: Event) => void) => {
      const event1 = {
        target: {
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
        }
      };

      const event2 = {
        target: {
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

  benchmark(suite, result, printer);
});
