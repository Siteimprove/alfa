export function encodeAngleBrackets(str) {
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
