import { test } from "@siteimprove/alfa-test";
import { Event } from "benchmark";
import { benchmark, Result, Suite } from "../src/benchmark";

test("Collects stats in each cycle", t => {
  const result = new Array<Result>();
  const suite: Suite = {
    on: (title: string, emit: ({ target }: Event) => void) => {
      const event = new Event("cycle");
      event.target = {
        name: "cycle",
        hz: 1,
        stats: {
          deviation: 2,
          mean: 3,
          moe: 4,
          rme: 5,
          sample: [6],
          sem: 7,
          variance: 8
        }
      };

      emit(event);

      t.deepEqual(result, [
        { title: "cycle", frequency: 1, margin: 5, samples: 1 }
      ]);
    },
    run: () => {},
    add: (title: string, callback: () => void | Promise<void>) => suite
  };

  benchmark(suite, result);
});
