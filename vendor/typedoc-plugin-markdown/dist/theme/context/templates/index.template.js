export function index(page) {
    const md = [];
    if (!this.options.getValue('hidePageHeader')) {
        md.push(this.partials.header());
    }
    if (!this.options.getValue('hideBreadcrumbs')) {
        md.push(this.partials.breadcrumbs());
    }
    if (page.model.readme) {
        md.push(this.helpers.getCommentParts(page.model.readme));
    }
    if (this.options.getValue('mergeReadme')) {
        md.push(this.partials.body(page.model, { headingLevel: 2 }));
    }
    md.push(this.partials.footer());
    return md.join('\n\n');
}
