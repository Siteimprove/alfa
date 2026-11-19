import { formatTableCell } from '../../libs/utils/index.js';
/**
 * Comments for table
 * @param headers
 * @param rows
 */
export function table(headers, rows, headerLeftAlign = false) {
    return `\n| ${headers.join(' | ')} |\n| ${headers
        .map(() => `${headerLeftAlign ? ':' : ''}------`)
        .join(' | ')} |\n${rows.map((row) => `| ${row.map((cell) => formatTableCell(cell)).join(' | ')} |\n`).join('')}`;
}
