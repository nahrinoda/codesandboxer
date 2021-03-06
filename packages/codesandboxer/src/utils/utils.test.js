// @flow
import cases from 'jest-in-case';
import getAllImports from './getAllImports';
import resolvePath from './resolvePath';
import absolutesToRelative from './absolutesToRelative';
import path from 'path';

const codeImportTests = [
  { name: 'simple import', code: "import a from 'b'", imports: ['b'] },
  { name: 'spread import', code: "import { a } from 'b'", imports: ['b'] },
  {
    name: 'two imports',
    code: "import a from 'b' import c from 'd'",
    imports: ['b', 'd'],
  },
  {
    name: 'multiline imports',
    code: `import a from 'b'
import c from 'd'`,
    imports: ['b', 'd'],
  },
  {
    name: 'two spread imports',
    code: "import { a, b } from 'c'",
    imports: ['c'],
  },
  {
    name: 'two spread imports multiline',
    code: `import {
  a,
  b
} from 'c'`,
    imports: ['c'],
  },
  { name: 'no spaces', code: "import {a} from 'b'", imports: ['b'] },
  {
    name: 'dev and peer deps',
    code: "import {a} from 't' import s from 'z' import y from 'x'",
    imports: ['t', 'z', 'x'],
  },
  {
    name: 'relativeImport',
    code: "import {a} from './c'",
    imports: ['./c'],
  },
  {
    name: 'using regex pattern',
    code: "import a from './c/somewhere' import b from './c/anywhere'",
    imports: ['./c/somewhere', './c/anywhere'],
  },
  {
    name: 'import then immediately export',
    code: "export { default } from './abc'",
    imports: ['./abc'],
  },
  {
    name: 'import then immediately export as value',
    code: "export { default as something } from './abc'",
    imports: ['./abc'],
  },
  {
    name: 'import then immediately export not default',
    code: "export { urd as something } from './abc' } from 'esk'",
    imports: ['./abc'],
  },
];

cases(
  'getAllImports()',
  ({ code, imports }) => {
    let mpts = getAllImports(code);
    // $FlowFixMe matchObject is a fine way to compare arrays
    expect(mpts).toMatchObject(imports);
  },
  codeImportTests,
);

cases(
  'resolvePath()',
  ({ basePath, relativePath, returnedPath }) => {
    let res = resolvePath(basePath, relativePath);
    expect(res).toBe(returnedPath);
  },
  [
    { basePath: 'a/b/c', relativePath: '../z', returnedPath: 'a/z' },
    {
      basePath: 'a/b/c',
      relativePath: '../../z/x',
      returnedPath: 'z/x',
    },
    { basePath: 'a/b/c', relativePath: './z', returnedPath: 'a/b/z' },
    {
      basePath: 'a/b/c',
      relativePath: 'zxy',
      returnedPath: 'a/b/c/zxy',
    },
    {
      basePath: 'a/b/c/',
      relativePath: './zxy',
      returnedPath: 'a/b/zxy',
    },
    {
      basePath: '../..',
      relativePath: './a',
      returnedPath: '../a',
    },
  ],
);

test('resolve path throws when path is too long', () => {
  let basePath = 'a/b/c';
  let relativePath = '../../../z/x';
  expect(() => resolvePath(basePath, relativePath)).toThrow();
});

test('resolve path throws when path is too long mk2', () => {
  let basePath = '..';
  let relativePath = '../z';
  expect(() => resolvePath(basePath, relativePath)).toThrow();
});

cases(
  'absolutesToRelative different dirs',
  ({ currentLocation, targetLocation }) => {
    let actualPath = path.relative(
      path.dirname(currentLocation),
      targetLocation,
    );
    expect(absolutesToRelative(currentLocation, targetLocation)).toBe(
      actualPath,
    );
  },
  [
    {
      name: 'basic case',
      currentLocation: 'examples/somewhere.js',
      targetLocation: 'src',
    },
    {
      name: 'more deeply nested',
      currentLocation: 'examples/deeper/somewhere.js',
      targetLocation: 'src',
    },
    {
      name: 'in same subdirectory',
      currentLocation: 'examples/deeper/somewhere.js',
      targetLocation: 'examples/fork/elsewhere',
    },
  ],
);

cases(
  'absolutesToRelative same dir',
  ({ currentLocation, targetLocation }) => {
    let actualPath = path.relative(
      path.dirname(currentLocation),
      targetLocation,
    );
    expect(absolutesToRelative(currentLocation, targetLocation)).toBe(
      `./${actualPath}`,
    );
  },
  [
    {
      name: 'in same directory',
      currentLocation: 'examples/deeper/somewhere.js',
      targetLocation: 'examples/deeper/elsewhere',
    },
    {
      name: 'in subdirectory',
      currentLocation: 'examples/somewhere.js',
      targetLocation: 'examples/deeper/elsewhere',
    },
  ],
);
