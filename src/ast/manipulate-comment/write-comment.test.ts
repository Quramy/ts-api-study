import assert from "assert";
import ts from "typescript";

describe("write comment", () => {
  test("add leading comment", () => {
    const statement = ts.createExpressionStatement(ts.createIdentifier("debugger"));
    ts.addSyntheticLeadingComment(statement, ts.SyntaxKind.MultiLineCommentTrivia, "eslint-disable", true);
    assert.equal(printNode(statement), "/*eslint-disable*/\ndebugger;");
  });

  test("read synthetic comments", () => {
    const statement = ts.createExpressionStatement(ts.createIdentifier("debugger"));
    ts.addSyntheticLeadingComment(statement, ts.SyntaxKind.MultiLineCommentTrivia, "eslint-disable", true);
    const src = ts.updateSourceFileNode(ts.createSourceFile("main.ts", "", ts.ScriptTarget.Latest, true), [statement]);
    assert(printNode(src).indexOf("/*eslint-disable*/") !== -1);
    const commentRange = ts.getLeadingCommentRanges(src.getFullText(), src.getFullStart());

    // We can not access synthetic comments with getLeadingCommentRanges/getTrailingCommentRanges
    assert.equal(commentRange, undefined);

    // Use getSyntheticLeadingComments to read synthetic comments
    assert.equal(ts.getSyntheticLeadingComments(src.statements[0])![0].text, "eslint-disable");

    // Unlike leading trivia, getSyntheticLeadingComments does not return comment ranges for parents of the node attached comments
    assert.equal(ts.getSyntheticLeadingComments(src), undefined);
  });
});

function printNode(node: ts.Node) {
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
    removeComments: false,
  });
  if (ts.isSourceFile(node)) return printer.printFile(node);
  return printer.printNode(ts.EmitHint.Unspecified, node, ts.createSourceFile("", "", ts.ScriptTarget.Latest));
}
