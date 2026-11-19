import { htmlTable, link, table } from '../../../libs/markdown/index.js';
import { escapeChars } from '../../../libs/utils/index.js';
import { i18n } from 'typedoc';
export function packagesIndex(model) {
    const leftAlignHeadings = this.options.getValue('tableColumnSettings').leftAlignHeaders;
    const md = [];
    const includeVersion = model.children?.some((projectPackage) => Boolean(projectPackage.packageVersion));
    if (this.options.getValue('indexFormat').toLowerCase().includes('table')) {
        const headers = [i18n.theme_package()];
        if (includeVersion) {
            headers.push(i18n.theme_version());
        }
        headers.push(i18n.theme_description());
        const packageRows = model.children?.map((projectPackage) => {
            const packageMeta = this.getPackageMetaData(projectPackage.name);
            const rows = [
                link(`${escapeChars(projectPackage.name)}`, this.urlTo(projectPackage)),
            ];
            if (includeVersion) {
                rows.push(projectPackage.packageVersion || '-');
            }
            rows.push(packageMeta?.description || '-');
            return rows;
        });
        const output = this.options.getValue('indexFormat') === 'htmlTable'
            ? htmlTable(headers, packageRows || [], leftAlignHeadings)
            : table(headers, packageRows || [], leftAlignHeadings);
        md.push(output);
    }
    else {
        const packagesList = model.children?.map((projectPackage) => {
            return this.router.hasUrl(projectPackage)
                ? `- ${link(`${escapeChars(projectPackage.name)}${projectPackage.packageVersion ? ` - v${projectPackage.packageVersion}` : ''}`, this.urlTo(projectPackage))}`
                : '';
        });
        md.push(packagesList?.join('\n') || '');
    }
    return md.join('\n\n');
}
