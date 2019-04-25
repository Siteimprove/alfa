export function isIterable(input: unknown): input is Iterable<unknown> {
  return (
    typeof input === "object" && input !== null && Symbol.iterator in input
  );
}
