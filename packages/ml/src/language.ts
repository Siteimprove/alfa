export interface Language {
  detect(text: string): "en" | "da" | null;
}
