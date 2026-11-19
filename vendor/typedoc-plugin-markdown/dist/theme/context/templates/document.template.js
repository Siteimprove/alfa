export function document(page) {
    const md = [];
    if (!this.options.getValue('hidePageHeader')) {
        md.push(this.partials.header());
    }
    if (!this.options.getValue('hideBreadcrumbs')) {
        md.push(this.partials.breadcrumbs());
    }
    md.push(this.helpers.getCommentParts(page.model.content));
    md.push(this.partials.footer());
    return md.join('\n\n');
}
