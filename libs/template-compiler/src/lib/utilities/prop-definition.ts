import * as ts from 'typescript';

export interface PropDefinition {
  value?: ts.Expression;
  type?: ts.KeywordTypeSyntaxKind;
}
