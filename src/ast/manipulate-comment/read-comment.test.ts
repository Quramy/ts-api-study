import assert from "assert";
import ts from "typescript";

describe("Read comment", () => {
  test("access leading comments with getLeadingTrivia", () => {
    const content = `/* hoge */  a = 1`;
    const src = ts.createSourceFile("main.ts", content, ts.ScriptTarget.Latest, true);

    assert.equal(src.getLeadingTriviaWidth(), "/* hoge */  ".length);
    assert.equal(src.getFullText().slice(0, src.getLeadingTriviaWidth()), "/* hoge */  ");
  });

  test("read leading comment", () => {
    const content = `/* hoge */  a = 1;`;
    const src = ts.createSourceFile("main.ts", content, ts.ScriptTarget.Latest, true);

    let node: ts.Node;
    let commentRange: ts.CommentRange;
    node = src.statements[0];
    assert.equal(node.getLeadingTriviaWidth(), "/* hoge */  ".length);
    commentRange = ts.getLeadingCommentRanges(src.getFullText(), node.getFullStart())![0]; // It does not work if using getStart()
    assert.equal(commentRange.kind, ts.SyntaxKind.MultiLineCommentTrivia);
    assert.equal(src.getFullText().slice(commentRange.pos, commentRange.end), "/* hoge */");

    node = (node as ts.ExpressionStatement).expression;
    commentRange = ts.getLeadingCommentRanges(src.getFullText(), node.getFullStart())![0];
    assert.equal(src.getFullText().slice(commentRange.pos, commentRange.end), "/* hoge */");

    const left = (node as ts.BinaryExpression).left;
    commentRange = ts.getLeadingCommentRanges(src.getFullText(), left.getFullStart())![0];
    assert.equal(src.getFullText().slice(commentRange.pos, commentRange.end), "/* hoge */");

    const right = (node as ts.BinaryExpression).right;
    assert.equal(ts.getLeadingCommentRanges(src.getFullText(), right.getFullStart()), undefined);
  });

  test("read trailing comment", () => {
    const content = `"hoge"; // TODO`;
    const src = ts.createSourceFile("main.ts", content, ts.ScriptTarget.Latest, true);

    const node = src.statements[0] as ts.ExpressionStatement;
    const commentRange = ts.getTrailingCommentRanges(src.getFullText(), node.getEnd())![0];
    assert.equal(commentRange.kind, ts.SyntaxKind.SingleLineCommentTrivia);
  });
});
