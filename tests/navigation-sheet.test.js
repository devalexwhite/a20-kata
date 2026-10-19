import { Instruction, NavigationSheet } from '../dist/app.js';

test('starts with no instructions', () => {
  expect(new NavigationSheet().getNavigationInstructions()).toEqual([]);
});

test('parses each command in order', () => {
  const sheet = new NavigationSheet(['forward 5', 'down 3', 'up 2']);

  expect(sheet.getNavigationInstructions()).toEqual([
    { instruction: Instruction.Forward, delta: 5 },
    { instruction: Instruction.Down, delta: 3 },
    { instruction: Instruction.Up, delta: 2 },
  ]);
});

test('ignores blank lines and trims whitespace', () => {
  const sheet = new NavigationSheet(['', '   ', '  forward 5  ']);

  expect(sheet.getNavigationInstructions()).toEqual([
    { instruction: Instruction.Forward, delta: 5 },
  ]);
});

test.each([
  'backward 5',
  'forward nope',
  'backward forward 5',
  'forward 1.5',
  'forward 5 down 3',
])('rejects invalid input: %s', (line) => {
  expect(() => new NavigationSheet([line])).toThrow('Invalid line');
});
