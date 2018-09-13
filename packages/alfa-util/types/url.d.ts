declare class URL {
  public hash: string;
  public host: string;
  public hostname: string;
  public href: string;
  public readonly origin: string;
  public password: string;
  public pathname: string;
  public port: string;
  public protocol: string;
  public search: string;
  public readonly searchParams: URLSearchParams;
  public username: string;
  public constructor(input: string, base?: string | URL);
  public toJSON(): string;
}

declare class URLSearchParams implements Iterable<[string, string]> {
  public constructor(
    init?:
      | Array<Array<string>>
      | Record<string, string>
      | string
      | URLSearchParams
  );
  public append(name: string, value: string): void;
  public delete(name: string): void;
  public entries(): IterableIterator<[string, string]>;
  public forEach(
    callback: (value: string, key: string, parent: URLSearchParams) => void
  ): void;
  public get(name: string): string | null;
  public getAll(name: string): Array<string>;
  public has(name: string): boolean;
  public keys(): IterableIterator<string>;
  public set(name: string, value: string): void;
  public sort(): void;
  public values(): IterableIterator<string>;
  public [Symbol.iterator](): IterableIterator<[string, string]>;
}
