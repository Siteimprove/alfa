import * as browserify from "browserify";

/**
 * @internal
 */
export function bundle(file: string, options: object = {}): Promise<string> {
  return new Promise((resolve, reject) =>
    browserify(file, options)
      .require(file)
      .bundle((error, buffer) => {
        if (error) {
          reject(error);
        } else {
          resolve(
            `(()=>{let require;${buffer.toString("utf8")};return require})();`
          );
        }
      })
  );
}
