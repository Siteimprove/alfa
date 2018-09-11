declare module "axios" {
  interface Response {
    data: string;
  }

  interface Axios {
    get(url: string): Promise<Response>;
  }

  export = Axios;
}
