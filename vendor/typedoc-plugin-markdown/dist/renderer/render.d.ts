import { MarkdownPageEvent, MarkdownRendererEvent } from '../events/index.js';
import { MarkdownRenderer } from '../types/index.js';
import { ProjectReflection } from 'typedoc';
/**
 * The render method for the Markdown plugin
 *
 * @remarks
 *
 * This is essentially a copy the default theme render method with some adjustments.
 *
 * - Removes unnecessary async calls to load highlighters only required for html theme.
 * - Removes hooks logic that are jsx specific.
 * - Adds any logic specific to markdown rendering.
 */
export declare function render(renderer: MarkdownRenderer, project: ProjectReflection, outputDirectory: string): Promise<void>;
export declare function executeAsyncRendererJobs(jobs: Array<(output: MarkdownRendererEvent) => Promise<void>>, output: MarkdownRendererEvent): Promise<void>;
export declare function executeAsyncPageJobs(jobs: Array<(page: MarkdownPageEvent) => Promise<void>>, page: MarkdownPageEvent): Promise<void>;
