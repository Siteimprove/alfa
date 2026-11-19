export function getDescriptionForComment(comment) {
    if (comment?.summary?.length) {
        return this.helpers
            .getCommentParts(comment.summary)
            ?.split(/(\r?\n){2}/)[0]
            .replace(/\r?\n/g, ' ');
    }
    return null;
}
