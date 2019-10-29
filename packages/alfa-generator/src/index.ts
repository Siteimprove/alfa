import { Generator } from "./generator";

type generator<T, R = unknown, N = unknown> = Generator<T, R, N>;
const generator = Generator;

export { generator as Generator };
