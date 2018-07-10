declare class URL {
  constructor(input: string, base?: string | URL);
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
  public toString(): string;
  public toJSON(): string;
}

declare class URLSearchParams implements Iterable<[string, string]> {
  constructor(
    init?:
      | URLSearchParams
      | string
      | { [key: string]: string | Array<string> | undefined }
      | Iterable<[string, string]>
      | Array<[string, string]>
  );
  public append(name: string, value: string): void;
  public delete(name: string): void;
  public entries(): IterableIterator<[string, string]>;
  public forEach(callback: (value: string, name: string) => void): void;
  public get(name: string): string | null;
  public getAll(name: string): Array<string>;
  public has(name: string): boolean;
  public keys(): IterableIterator<string>;
  public set(name: string, value: string): void;
  public sort(): void;
  public toString(): string;
  public values(): IterableIterator<string>;
  public [Symbol.iterator](): IterableIterator<[string, string]>;
}
