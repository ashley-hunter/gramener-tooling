import * as monaco from 'monaco-editor';
import { templateCompiler } from '@gramener-tooling/template-compiler';
import { format } from 'prettier/standalone';
import * as typescriptParser from 'prettier/parser-typescript';

const editorContainer = document.getElementById('editor');

const editor = monaco.editor.create(editorContainer, {
  value: [
    '<svg width={width || 300} height={height || 300}>',
    "  <circle cx={cx || '50%'} cy={cy || '50%'} r={r} fill={fill}> </circle>",
    '</svg>',
  ].join('\n'),
  language: 'html',
});

editor.onDidChangeModelContent(() => {
  const code = editor.getValue();
  const result = templateCompiler(code);
  const resultContainer = document.getElementById('result');

  resultContainer.innerText = format(result, {
    parser: 'typescript',
    plugins: [typescriptParser],
  });
});
