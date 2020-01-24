import assert from "assert";
import ts from "typescript";

describe("transform comment", () => {
  test("update comment within transformer", () => {
    const content = "// todo\nconsole.log('hoge');";
    const originalSrc = ts.createSourceFile("main.ts", content, ts.ScriptTarget.Latest, true);
    const transformer = (ctx: ts.TransformationContext) => {
      return (src: ts.SourceFile) => {
        const text = src.getFullText();
        let previousCommentPos = -1;
        const visit = <T extends ts.Node>(node: T): T => {
          if (ts.isSourceFile(node)) return ts.visitEachChild(node, visit, ctx);
          ts.forEachLeadingCommentRange(text, node.getFullStart(), (pos, end, kind, hasTrailingNewLine) => {
            if (pos === previousCommentPos) return;
            const commentContent =
              kind === ts.SyntaxKind.MultiLineCommentTrivia ? text.slice(pos + 2, end - 2) : text.slice(pos + 2, end);
            src.text = text.slice(0, pos).padEnd(end, " ") + text.slice(end);
            ts.addSyntheticLeadingComment(node, kind, commentContent.toUpperCase(), hasTrailingNewLine);
            previousCommentPos = pos;
          });
          return ts.visitEachChild(node, visit, ctx);
        };
        return visit(src);
      };
    };
    const { transformed } = ts.transform(originalSrc, [transformer], ts.getDefaultCompilerOptions());
    assert.equal(
      ts.createPrinter({ newLine: ts.NewLineKind.LineFeed, removeComments: false }).printFile(transformed[0]),
      "// TODO\nconsole.log('hoge');\n",
    );
  });
});
