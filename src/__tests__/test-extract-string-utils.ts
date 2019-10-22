import StringUtil from "../util/extract-string-util";

test("collapseRightWhitespace removes whitespace at end of string", () => {
    let rightspace = "text ends in whitespace ";
    let nospace = "text ends in whitespace";
    expect(StringUtil.collapseRightWhitespace(rightspace)).toBe(nospace);
});

test("collapseRightWhitespace keeps whitespace at start of string", () => {
    let leftspace = " text ends in whitespace";
    expect(StringUtil.collapseRightWhitespace(leftspace)).toBe(leftspace);
});

test("collapseRightWhitespace keeps trimmed string intact", () => {
    let nospace = "text ends in whitespace";
    expect(StringUtil.collapseRightWhitespace(nospace)).toBe(nospace);
});

test("collapseRightWhitespace keeps newline at end of string", () => {
    let rightnewline = "text ends in whitespace\n";
    expect(StringUtil.collapseRightWhitespace(rightnewline)).toBe(rightnewline);
});

test("collapseLeftWhitespace removes whitespace at end of string", () => {
    let leftspace = " text ends in whitespace";
    let nospace = "text ends in whitespace";
    expect(StringUtil.collapseLeftWhitespace(leftspace)).toBe(nospace);
});

test("collapseLeftWhitespace keeps whitespace at start of string", () => {
    let rightspace = "text ends in whitespace ";
    expect(StringUtil.collapseLeftWhitespace(rightspace)).toBe(rightspace);
});

test("collapseLeftWhitespace keeps trimmed string intact", () => {
    let nospace = "text ends in whitespace";
    expect(StringUtil.collapseLeftWhitespace(nospace)).toBe(nospace);
});

test("collapseLeftWhitespace keeps newline at end of string", () => {
    let leftnewline = "\ntext ends in whitespace";
    expect(StringUtil.collapseLeftWhitespace(leftnewline)).toBe(leftnewline);
});

test("collapseWhitespace removes whitespace at end of string", () => {
    let rightspace = "text ends in whitespace ";
    let nospace = "text ends in whitespace";
    expect(StringUtil.collapseWhitespace(rightspace)).toBe(nospace);
});

test("collapseWhitespace removes whitespace at start of string", () => {
    let leftspace = " text ends in whitespace";
    let nospace = "text ends in whitespace";
    expect(StringUtil.collapseWhitespace(leftspace)).toBe(nospace);
});

test("collapseWhitespace keeps trimmed string intact", () => {
    let nospace = "text ends in whitespace";
    expect(StringUtil.collapseWhitespace(nospace)).toBe(nospace);
});

test("collapseWhitespace keeps newline at end of string", () => {
    let rightnewline = "text ends in whitespace\n";
    expect(StringUtil.collapseWhitespace(rightnewline)).toBe(rightnewline);
});

test("isURL returns true for http valid URL", () => {
    let url = "http://example.com";
    expect(StringUtil.isURL(url)).toBe(true);
});

test("isURL returns false for non http URL", () => {
    let url = "ftp://example.com";
    expect(StringUtil.isURL(url)).toBe(false);
});

test("isURL returns false for http URL", () => {
    let url = "http://examplecom";
    expect(StringUtil.isURL(url)).toBe(false);
});

