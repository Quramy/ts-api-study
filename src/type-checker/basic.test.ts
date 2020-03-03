import ts from "typescript";
import assert from "assert";
import { mark, Frets } from "fretted-strings";

import { getNodeFromPosition, createProgram } from "../testing";

describe("typeChecker basic", () => {
  test("create symbol and type from program", () => {
    const frets: Frets = {};
    const program = createProgram([
      {
        fileName: "main.ts",
        content: mark(
          `
        const hoge = 100;
        %%%   ^       %%%
        %%%   p       %%%
      `,
          frets,
        ),
      },
    ]);
    const src = program.getSourceFile("main.ts")!;
    const checker = program.getTypeChecker();
    const node = getNodeFromPosition(src, frets.p.pos)!;
    const symbol = checker.getSymbolAtLocation(node)!;
    assert.equal(symbol.escapedName, "hoge");
    const type = checker.getTypeOfSymbolAtLocation(symbol, node);
    assert.equal(checker.typeToString(type), "100");
  });
});
