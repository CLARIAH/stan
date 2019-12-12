import StringUtil from "../util/extract-string-util";

const stringUtil = new StringUtil();

test("collapseRightWhitespace removes whitespace at end of string", () => {
    let rightspace = "text ends in whitespace ";
    let nospace = "text ends in whitespace";
    expect(stringUtil.collapseRightWhitespace(rightspace)).toBe(nospace);
});

test("collapseRightWhitespace keeps whitespace at start of string", () => {
    let leftspace = " text ends in whitespace";
    expect(stringUtil.collapseRightWhitespace(leftspace)).toBe(leftspace);
});

test("collapseRightWhitespace keeps trimmed string intact", () => {
    let nospace = "text ends in whitespace";
    expect(stringUtil.collapseRightWhitespace(nospace)).toBe(nospace);
});

test("collapseRightWhitespace keeps newline at end of string", () => {
    let rightnewline = "text ends in whitespace\n";
    expect(stringUtil.collapseRightWhitespace(rightnewline)).toBe(rightnewline);
});

test("collapseLeftWhitespace removes whitespace at end of string", () => {
    let leftspace = " text ends in whitespace";
    let nospace = "text ends in whitespace";
    expect(stringUtil.collapseLeftWhitespace(leftspace)).toBe(nospace);
});

test("collapseLeftWhitespace keeps whitespace at start of string", () => {
    let rightspace = "text ends in whitespace ";
    expect(stringUtil.collapseLeftWhitespace(rightspace)).toBe(rightspace);
});

test("collapseLeftWhitespace keeps trimmed string intact", () => {
    let nospace = "text ends in whitespace";
    expect(stringUtil.collapseLeftWhitespace(nospace)).toBe(nospace);
});

test("collapseLeftWhitespace keeps newline at end of string", () => {
    let leftnewline = "\ntext ends in whitespace";
    expect(stringUtil.collapseLeftWhitespace(leftnewline)).toBe(leftnewline);
});

test("collapseWhitespace removes whitespace at end of string", () => {
    let rightspace = "text ends in whitespace ";
    let nospace = "text ends in whitespace";
    expect(stringUtil.collapseWhitespace(rightspace)).toBe(nospace);
});

test("collapseWhitespace removes whitespace at start of string", () => {
    let leftspace = " text ends in whitespace";
    let nospace = "text ends in whitespace";
    expect(stringUtil.collapseWhitespace(leftspace)).toBe(nospace);
});

test("collapseWhitespace keeps trimmed string intact", () => {
    let nospace = "text ends in whitespace";
    expect(stringUtil.collapseWhitespace(nospace)).toBe(nospace);
});

test("collapseWhitespace keeps newline at end of string", () => {
    let rightnewline = "text ends in whitespace\n";
    expect(stringUtil.collapseWhitespace(rightnewline)).toBe(rightnewline);
});

test("isURL returns true for http valid URL", () => {
    let url = "http://example.com";
    expect(stringUtil.isURL(url)).toBe(true);
});

test("isURL returns false for non http URL", () => {
    let url = "ftp://example.com";
    expect(stringUtil.isURL(url)).toBe(false);
});

test("isURL returns false for http URL", () => {
    let url = "http://examplecom";
    expect(stringUtil.isURL(url)).toBe(false);
});

