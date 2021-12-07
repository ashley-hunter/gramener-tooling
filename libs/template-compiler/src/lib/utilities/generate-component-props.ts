import { PropDefinition } from './prop-definition';
import * as ts from 'typescript';
import { factory } from 'typescript';

export function generateComponentProps(props: Map<string, PropDefinition>) {
  // iterate each property and create a class property with a Prop decorator
  const properties: ts.PropertyDeclaration[] = [];

  // map each property in the map
  props.forEach((prop, key) => properties.push(createProperty(key, prop)));

  return properties;
}

function createProperty(key: string, prop: PropDefinition) {
  return factory.createPropertyDeclaration(
    [createPropDecorator()],
    undefined,
    factory.createIdentifier(key),
    undefined,
    getTypeAnnotation(prop),
    prop.value
  );
}

function createPropDecorator() {
  return factory.createDecorator(
    factory.createCallExpression(
      factory.createIdentifier('Prop'),
      undefined,
      []
    )
  );
}

function getTypeAnnotation(
  prop: PropDefinition
): ts.KeywordTypeNode | undefined {
  // if we know the type use it
  if (prop.type) {
    return factory.createKeywordTypeNode(prop.type);
  }

  // if we have a default value we don't need an explicit type as typescript can infer it
  if (prop.value) {
    return undefined;
  }

  // otherwise, default to any type
  return factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
}
