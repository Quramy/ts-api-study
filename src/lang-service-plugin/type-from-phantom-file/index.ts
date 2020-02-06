import path from "path";
import ts from "typescript/lib/tsserverlibrary";

const createPlugin: ts.server.PluginModuleFactory = () => {
  return {
    create: (info: ts.server.PluginCreateInfo) => {
      const { languageService, languageServiceHost } = info;
      const dir = languageServiceHost.getCurrentDirectory();
      const phantomFileName = path.resolve(dir, "./hoge.d.ts");
      languageServiceHost.getScriptFileNames = new Proxy(languageServiceHost.getScriptFileNames, {
        apply: (target, self) => {
          const original = target.apply(self);
          info.project.log("HOGE " + phantomFileName);
          return [...original, phantomFileName];
        },
      });
      languageServiceHost.getScriptVersion = new Proxy(languageServiceHost.getScriptVersion, {
        apply: (target, self, args: [string]) => {
          const fileName = args[0];
          if (fileName !== phantomFileName) return target.apply(self, args);
          return "";
        },
      });
      languageServiceHost.getScriptSnapshot = new Proxy(languageServiceHost.getScriptSnapshot, {
        apply: (target, self, args: [string]) => {
          const fileName = args[0];
          if (fileName !== phantomFileName) return target.apply(self, args);
          return ts.ScriptSnapshot.fromString("export type Hoge = string;");
        },
      });
      if (languageServiceHost.getScriptKind) {
        languageServiceHost.getScriptKind = new Proxy(languageServiceHost.getScriptKind, {
          apply: (target, self, args: [string]) => {
            const fileName = args[0];
            if (fileName !== phantomFileName) return target.apply(self, args);
            return ts.ScriptKind.TS;
          },
        });
      }
      languageServiceHost.getResolvedModuleWithFailedLookupLocationsFromCache;
      return languageService;
    },
  };
};

export = createPlugin;
