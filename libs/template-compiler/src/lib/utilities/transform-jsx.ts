import * as ts from 'typescript';
import { PropDefinition } from './prop-definition';

/**
 * We want to make several transformations to JSX attributes:
 *
 * 1. If the value references a variable, we must make it reference the class property instead. E.g. fill={fill} -> fill={this.fill}
 * 2. If there is a default value we can extract and remove it . E.g. fill={fill || 'black'} -> fill={this.fill} and make the property have that initial value fill = 'black';
 * 3. We should also support ?? for default values. E.g. fill={fill  ?? 'black'} -> fill={this.fill} and make the property have that initial value fill = 'black';
 */
const jsxAttributeTransformer = (
  props: Map<string, PropDefinition>
): ts.TransformerFactory<ts.JsxElement> => {
  return (context: ts.TransformationContext) => {
    return (node: ts.JsxElement) => {
      // visit each node and if the node is a jsx attribute, perform any required transformations
      const visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
        // if the node is a jsx attribute
        if (ts.isJsxAttribute(node)) {
          const initializer = ts.transform(node.initializer!, [
            defaultValueTransformer(props),
            identifierTransformer(props),
          ]).transformed[0];

          return ts.factory.createJsxAttribute(node.name, initializer);
        }

        return ts.visitEachChild(node, visitor, context);
      };

      return ts.visitNode(node, visitor);
    };
  };
};

export function transformJsx(
  element: ts.JsxElement,
  props: Map<string, PropDefinition>
): ts.JsxElement {
  return ts.transform(element, [jsxAttributeTransformer(props)]).transformed[0];
}

function identifierTransformer(
  props: Map<string, PropDefinition>
): ts.TransformerFactory<ts.JsxExpression | ts.StringLiteral> {
  return function (context: ts.TransformationContext) {
    return (node: ts.JsxExpression | ts.StringLiteral) => {
      // string literal values do not need processed
      if (ts.isStringLiteral(node)) {
        return node;
      }

      // visit each node and if the node is a jsx attribute, perform any required transformations
      const visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
        if (ts.isIdentifier(node)) {
          if (!props.has(node.text)) {
            props.set(node.text, {});
          }

          return ts.factory.createPropertyAccessExpression(
            ts.factory.createThis(),
            node.getText()
          );
        }

        return ts.visitEachChild(node, visitor, context);
      };

      return ts.visitNode(node, visitor);
    };
  };
}

function defaultValueTransformer(
  props: Map<string, PropDefinition>
): ts.TransformerFactory<ts.JsxExpression | ts.StringLiteral> {
  return function (context: ts.TransformationContext) {
    return (node: ts.JsxExpression | ts.StringLiteral) => {
      // string literal values do not need processed
      if (ts.isStringLiteral(node)) {
        return node;
      }

      // visit each node and if the node is a jsx attribute, perform any required transformations
      const visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
        if (ts.isBinaryExpression(node)) {
          if (
            node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken ||
            node.operatorToken.kind === ts.SyntaxKind.BarBarToken
          ) {
            const propName = node.left.getText();

            if (!props.has(propName) || !props.get(propName)?.value) {
              props.set(propName, {
                ...props.get(propName),
                value: stripRanges(node.right),
              });
            }

            return node.left;
          }
        }

        return ts.visitEachChild(node, visitor, context);
      };

      return ts.visitNode(node, visitor);
    };
  };
}

/**
 * Workaround for https://stackoverflow.com/questions/57367392/how-can-i-inject-additional-statements-into-a-function-using-ts-transform/57367717#57367717
 * @param node
 */
function stripRanges<T extends ts.Node>(node: T): T {
  (node as any).pos = -1;
  (node as any).end = -1;

  ts.forEachChild(node, stripRanges);

  return node;
}
