import { Reflection, } from 'typedoc';
/**
 * An event emitted before and after the markdown of a page is rendered.
 *
 * @event
 */
export class MarkdownPageEvent {
    /**
     * The project the renderer is currently processing.
     */
    project;
    /**
     * The filename the page will be written to.
     */
    filename;
    /**
     * The url this page will be located at.
     */
    url;
    /**
     * The type of page this is.
     */
    pageKind;
    /**
     * The model that should be rendered on this page.
     */
    model;
    /**
     * The final html content of this page.
     *
     * Should be rendered by layout templates and can be modified by plugins.
     */
    contents = '';
    /**
     * The frontmatter of this page represented as a key value object. This property can be utilised by other plugins.
     */
    frontmatter;
    /** @hidden */
    pageHeadings = [];
    /** @hidden */
    pageSections = [
        {
            title: '',
            headings: this.pageHeadings,
        },
    ];
    /** @hidden */
    startNewSection() {
        this.pageHeadings = [];
        this.pageSections = [];
    }
    /**
     * Triggered before a document will be rendered.
     * @event
     */
    static BEGIN = 'beginPage';
    /**
     * Triggered after a document has been rendered, just before it is written to disc.
     * @event
     */
    static END = 'endPage';
    constructor(model) {
        this.model = model;
    }
    preWriteAsyncJobs = [];
    isReflectionEvent() {
        return this.model instanceof Reflection;
    }
}
