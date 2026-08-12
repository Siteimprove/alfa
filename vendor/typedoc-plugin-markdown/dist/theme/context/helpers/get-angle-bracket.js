export function getAngleBracket(bracket) {
    const useEntities = this.options.getValue('useHTMLEncodedBrackets');
    if (bracket === '<') {
        return useEntities ? '&lt;' : '\\<';
    }
    return useEntities ? '&gt;' : '\\>';
}
