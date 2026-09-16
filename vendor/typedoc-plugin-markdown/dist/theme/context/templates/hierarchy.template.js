import { heading, horizontalRule, link } from '../../../libs/markdown/index.js';
import { getHierarchyRoots } from '../../../theme/lib/index.js';
import { i18n } from 'typedoc';
export function hierarchy(page) {
    const md = [];
    const seen = new Set();
    md.push(this.hook('page.begin', this).join('\n'));
    if (!this.options.getValue('hidePageHeader')) {
        md.push(this.partials.header());
    }
    if (!this.options.getValue('hideBreadcrumbs')) {
        md.push(this.partials.breadcrumbs());
    }
    if (!this.options.getValue('hidePageTitle')) {
        md.push(heading(1, this.partials.pageTitle()));
    }
    md.push(this.hook('content.begin', this).join('\n'));
    const hierarchyRoots = getHierarchyRoots(page.project);
    md.push(heading(2, i18n.theme_hierarchy_summary()));
    hierarchyRoots.forEach((root) => {
        md.push(heading(3, root.name));
        md.push(fullHierarchy(this, root, seen));
        md.push(horizontalRule());
    });
    md.push(hierarchyRoots.map((root) => fullHierarchy(this, root, seen)).join('\n'));
    md.push(this.hook('content.end', this).join('\n'));
    md.push(this.partials.footer());
    md.push(this.hook('page.end', this).join('\n'));
    return md.join('\n\n');
}
function fullHierarchy(context, root, seen, level = 0) {
    if (seen.has(root)) {
        return '';
    }
    seen.add(root);
    const children = [];
    for (const child of [
        ...(root.implementedBy || []),
        ...(root.extendedBy || []),
    ]) {
        if (child.reflection) {
            children.push(fullHierarchy(context, child.reflection, seen, level + 1));
        }
    }
    const res = [
        `${'  '.repeat(level)}- ${link(root.name, context.router.getFullUrl(root))}`,
    ];
    if (children.length) {
        res.push(children.join('\n'));
    }
    return res.join('\n');
}
