const ts = require('typescript');
const path = require('path');

const configPath = ts.findConfigFile(
  path.resolve(__dirname, '..'),
  ts.sys.fileExists,
  'tsconfig.json'
);

if (!configPath) {
  console.error("tsconfig.json não encontrado!");
  process.exit(1);
}

const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsedCommandLine = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  path.dirname(configPath)
);

const program = ts.createProgram(parsedCommandLine.fileNames, {
  ...parsedCommandLine.options,
  incremental: false,
  noEmit: true
});

const emitResult = program.emit();
const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

let hasError = false;

allDiagnostics.forEach((diagnostic) => {
  if (diagnostic.category === ts.DiagnosticCategory.Error) {
    hasError = true;
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start
      );
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.error(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  }
});

if (hasError) {
  console.error("\n❌ Erros de compilação encontrados no TypeScript!");
  process.exit(1);
} else {
  console.log("\n✅ Typecheck concluído com sucesso: ZERO erros de compilação TypeScript!");
}
