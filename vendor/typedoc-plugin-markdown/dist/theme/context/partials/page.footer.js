export function footer() {
    const textContentMappings = this.options.getValue('textContentMappings');
    const text = textContentMappings?.['footer.text'];
    return text ? `***\n\n${text}` : ``;
}
