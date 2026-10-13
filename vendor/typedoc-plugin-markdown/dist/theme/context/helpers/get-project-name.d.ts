import { MarkdownPageEvent } from '../../../events/index.js';
import { Reflection } from 'typedoc';
export declare function getProjectName(stringWithPlaceholders: string, page: MarkdownPageEvent<Reflection>, includeVersion?: boolean): string;
