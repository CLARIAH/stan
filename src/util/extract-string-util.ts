
export default class StringUtil {

    collapseRightWhitespace (text: string) {
        return text.replace(/ +$/, "");
    }

    collapseLeftWhitespace (text: string) {
        return text.replace(/^ +/, "");
    }

    collapseWhitespace (text: string) {
        return this.collapseLeftWhitespace(this.collapseRightWhitespace(text));
    }

    isURL (text: string) {
        const pattern = new RegExp('^(https?:\\/\\/)'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name and extension
        'localhost|'+ // OR localhost
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?'+ // port
        '(\\/[-a-z\\d%@_.~+&:]*)*'+ // path
        '(\\?[;&a-z\\d%@_.,~+&:=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return pattern.test(text);
    }

}
