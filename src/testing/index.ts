import ts from "typescript";

export class MockHost implements ts.LanguageServiceHost {
  constructor(public contents: { fileName: string; content: string }[]) {}

  getDefaultLibFileName(options: ts.CompilerOptions): string {
    return ts.getDefaultLibFileName(options);
  }
  getCurrentDirectory(): string {
    return __dirname;
  }
  getScriptSnapshot(fileName: string): ts.IScriptSnapshot | undefined {
    const found = this.contents.find(c => c.fileName === fileName);
    if (!found) return;
    return ts.ScriptSnapshot.fromString(found.content);
  }
  getScriptVersion(fileName: string): string {
    return "0";
  }
  getScriptFileNames(): string[] {
    return this.contents.map(c => c.fileName);
  }
  getCompilationSettings(): ts.CompilerOptions {
    return ts.getDefaultCompilerOptions();
  }
}

export function createLangServiceAndHost(contents: { fileName: string; content: string }[]) {
  const languageServiceHost = new MockHost(contents);
  const languageService = ts.createLanguageService(languageServiceHost);
  return { languageServiceHost, languageService };
}

export function createLanguageService(contents: { fileName: string; content: string }[]) {
  const { languageService } = createLangServiceAndHost(contents);
  return languageService;
}

export function createProgram(contents: { fileName: string; content: string }[]) {
  const { languageService } = createLangServiceAndHost(contents);
  return languageService.getProgram()!;
}

export function getNodeFromPosition(node: ts.Node, pos: number) {
  let ret: ts.Node | undefined = undefined;
  const visit = (node: ts.Node) => {
    if (node.getStart() <= pos && pos < node.getEnd()) {
      ret = node;
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(node, visit);
  return ret;
}
