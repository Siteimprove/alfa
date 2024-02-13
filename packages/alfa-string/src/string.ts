/**
 * @public
 */
export type String = globalThis.String

/**
 * @public
 */
export namespace String {
    /**
     * Adds two spaces at the start of each line.
     */
    export function indent(input: string): string {
        return input.replace(/^/gm, "  ");
    }

    /**
     * Trims, collapses adjacent whitespace into a single ASCII space, optionally lowercases (default: true).
     */
    export function normalize(input: string, toLowerCase: boolean = true): string {
        return toLowerCase ? input.trim().toLowerCase().replace(/\s+/g, " ") : input.trim().replace(/\s+/g, " ");
    }
}