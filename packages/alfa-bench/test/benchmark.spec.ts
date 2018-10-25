import { test } from "@siteimprove/alfa-test";
import { Event, Options, Suite } from "benchmark";
import { benchmark, Result, Target } from "../src/benchmark";

const target: Target = {
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

const suite = new Suite();
suite.run = (options?: Options) => {
  const event = new Event("cycle");
  event.target = target;
  suite.emit(event);
  return suite;
};

test("Collects stats in each cycle", t => {
  const res: Array<Result> = [];
  const bench = benchmark(suite, res).add("Foo", () => {});
  bench.run();

  t.deepEqual(res, [{ title: "cycle", frequency: 1, margin: 5, samples: 1 }]);
});
