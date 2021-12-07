import * as ts from 'typescript';
import { factory } from 'typescript';
import { getRootJsxElement } from '../utilities/get-root-jsx-element';
import { transformJsx } from '../utilities/transform-jsx';
import { PropDefinition } from '../utilities/prop-definition';
import { generateComponentProps } from '../utilities/generate-component-props';

export function createStencilComponent(
  tag: string,
  code: string
): ts.Statement[] {
  const rootJsxElement = getRootJsxElement(code);
  const props = new Map<string, PropDefinition>();
  const jsx = transformJsx(rootJsxElement!, props);

  return [
    factory.createImportDeclaration(
      undefined,
      undefined,
      factory.createImportClause(
        false,
        undefined,
        factory.createNamedImports([
          factory.createImportSpecifier(
            undefined,
            factory.createIdentifier('Component')
          ),
          factory.createImportSpecifier(
            undefined,
            factory.createIdentifier('Prop')
          ),
          factory.createImportSpecifier(
            undefined,
            factory.createIdentifier('h')
          ),
          factory.createImportSpecifier(
            undefined,
            factory.createIdentifier('ComponentInterface')
          ),
        ])
      ),
      factory.createStringLiteral('@stencil/core')
    ),
    factory.createClassDeclaration(
      [
        factory.createDecorator(
          factory.createCallExpression(
            factory.createIdentifier('Component'),
            undefined,
            [
              factory.createObjectLiteralExpression(
                [
                  factory.createPropertyAssignment(
                    factory.createIdentifier('tag'),
                    factory.createStringLiteral('my-component')
                  ),
                ],
                true
              ),
            ]
          )
        ),
      ],
      [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      factory.createIdentifier('MyComponent'),
      undefined,
      [
        factory.createHeritageClause(ts.SyntaxKind.ImplementsKeyword, [
          factory.createExpressionWithTypeArguments(
            factory.createIdentifier('ComponentInterface'),
            undefined
          ),
        ]),
      ],
      [
        ...generateComponentProps(props),
        factory.createMethodDeclaration(
          undefined,
          undefined,
          undefined,
          factory.createIdentifier('render'),
          undefined,
          undefined,
          [],
          undefined,
          factory.createBlock(
            [
              factory.createReturnStatement(
                factory.createParenthesizedExpression(jsx!)
              ),
            ],
            true
          )
        ),
      ]
    ),
  ];
}
