import * as ts from 'typescript';
import { createStencilComponent } from './generators/create-stencil-component';

export function templateCompiler(code: string): string {
  // use typescript to parse the code
  const statements = createStencilComponent('my-component', code);

  // print all the statements using the typescript printer
  const printer = ts.createPrinter();
  return printer.printList(
    ts.ListFormat.MultiLine,
    ts.factory.createNodeArray(statements),
    ts.createSourceFile('', '', ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  );
}
