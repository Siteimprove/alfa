import { MarkdownPageEvent } from '../../../events/index.js';
import { MarkdownThemeContext } from '../../../theme/index.js';
import { DocumentReflection } from 'typedoc';
export declare function document(this: MarkdownThemeContext, page: MarkdownPageEvent<DocumentReflection>): string;
