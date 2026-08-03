import { ProjectReflection } from 'typedoc';
/**
 *  Writes a file to disc.
 */
export declare function writeFileSync(fileName: string, data: string): void;
/**
 * Recursively copy files
 */
export declare function copySync(src: string, dest: string): void;
export declare function copyMediaFiles(project: ProjectReflection, outputDirectory: string): void;
