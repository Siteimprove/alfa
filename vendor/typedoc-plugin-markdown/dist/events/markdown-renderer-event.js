/**
 * An event emitted at the beginning and end of the rendering process.
 *
 * @event
 */
export class MarkdownRendererEvent {
    /**
     * The project the renderer is currently processing.
     */
    project;
    /**
     * The path of the directory the documentation should be written to.
     */
    outputDirectory;
    /**
     * A list of all pages that will be generated.
     */
    pages;
    /**
     * The navigation structure of the project that can be utilised by plugins.
     */
    navigation;
    /**
     * Triggered before the renderer starts rendering a project.
     * @event
     */
    static BEGIN = 'beginRender';
    /**
     * Triggered after the renderer has written all documents.
     * @event
     */
    static END = 'endRender';
    /**
     * @ignore
     */
    constructor(outputDirectory, project, pages) {
        this.outputDirectory = outputDirectory;
        this.project = project;
        this.pages = pages;
    }
}
