import { NavigationSheet, Phase, Sub } from '../dist/app.js';

const sample = [
  'forward 5',
  'down 5',
  'forward 8',
  'up 3',
  'down 8',
  'forward 2',
];

test('starts at zero', () => {
  expect(new Sub()).toMatchObject({ position: 0, depth: 0, aim: 0 });
});

test('follows the phase 1 example', () => {
  const sub = new Sub(Phase.Kata1);
  sub.navigate(new NavigationSheet(sample));

  expect(sub).toMatchObject({ position: 15, depth: 10 });
  expect(sub.position * sub.depth).toBe(150);
});

test('follows the phase 2 example', () => {
  const sub = new Sub(Phase.Kata2);
  sub.navigate(new NavigationSheet(sample));

  expect(sub).toMatchObject({ position: 15, depth: 60, aim: 10 });
  expect(sub.position * sub.depth).toBe(900);
});

test('phase 2 up and down change aim without moving', () => {
  const sub = new Sub(Phase.Kata2);
  sub.navigate(new NavigationSheet(['down 5', 'up 3']));

  expect(sub).toMatchObject({ position: 0, depth: 0, aim: 2 });
});

test.each([
  [Phase.Kata1, -3],
  [Phase.Kata2, -6],
])('does not allow negative depth in either phase', (phase, depth) => {
  const sub = new Sub(phase);
  sub.navigate(new NavigationSheet(['up 3', 'forward 2']));

  expect(sub).toMatchObject({ position: 2, depth: 0 });
});
