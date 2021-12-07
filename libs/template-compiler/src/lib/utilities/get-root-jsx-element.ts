import * as ts from 'typescript';

export function getRootJsxElement(code: string): ts.JsxElement | undefined {
  const sourceFile = ts.createSourceFile(
    'test.tsx',
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  // visit the source file to find the JSX element
  let jsx: ts.JsxElement | undefined;

  function visitor(node: ts.Node): void {
    if (ts.isJsxElement(node)) {
      jsx = node;
    }

    if (!jsx) {
      ts.forEachChild(node, visitor);
    }
  }

  ts.forEachChild(sourceFile, visitor);

  return jsx;
}
