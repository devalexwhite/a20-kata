import chalk from 'chalk';
import boxen from 'boxen';
import fs from "fs";
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

export enum Instruction {
  Up,
  Down,
  Forward,
}

export enum Phase {
  Kata1,
  Kata2,
}

export class Sub {
  private depth: number;
  private position: number;
  private aim: number;
  private operatingPhase: Phase;

  constructor(phase: Phase = Phase.Kata1) {
    this.depth = 0;
    this.position = 0;
    this.aim = 0;
    this.operatingPhase = phase;
  }

  navigate(navigationSheet: NavigationSheet): void {
    for (let turn of navigationSheet.getNavigationInstructions()) {
      this.move(Phase.Kata1, turn.instruction, turn.delta);
    }
  }

  private move(phase: Phase = Phase.Kata1, instruction: Instruction, delta: number): void {
    switch (instruction) {
      case Instruction.Up:
        if (this.operatingPhase == Phase.Kata1) this.depth -= delta;
        else this.aim -= delta;
        break;
      case Instruction.Down:
        if (this.operatingPhase == Phase.Kata1) this.depth += delta;
        else this.aim += delta;
        break;
      case Instruction.Forward:
        this.position += delta;
        if (this.operatingPhase == Phase.Kata2) this.depth += this.aim * delta;
        break;
      default:
        console.error("Invalid instruction.");
        return;
    }

    // Prevents the submarine from flying away
    this.depth = Math.max(0, this.depth);
  }

  printCoordinates(): void {
    const content = [
      `Navigation Mode                ${chalk.blue(this.operatingPhase == Phase.Kata1 ? 'Kata 1' : 'Kata 2')}`,
      '',
      `Depth                          ${chalk.cyan(this.depth)}`,
      `Position                       ${chalk.cyan(this.position)}`,
      `Aim                            ${chalk.cyan(this.aim)}`,
      '',
      chalk.red.bold(
        `Final Result                   ${this.depth * this.position}`,
      ),
    ].join('\n');

    console.log(boxen(content, {
      title: 'Submarine Navigation',
      titleAlignment: 'left',
      padding: 2,
      borderStyle: 'round',
      borderColor: 'cyan'
    }));
  }
}

type NavigationTurn = {
  instruction: Instruction;
  delta: number;
};

export class NavigationSheet {
  private navInstructions: NavigationTurn[];

  constructor(textLines?: Array<string>) {
    this.navInstructions = [];

    if (textLines) {
      this.parseTurns(textLines);
    }
  }

  getNavigationInstructions(): NavigationTurn[] {
    return this.navInstructions;
  }

  private parseTurns(textLines: Array<string>): void {
    for (const line of textLines) {
      try {
        const parsedTurn = this.tryParseLine(line);
        if (parsedTurn) this.navInstructions.push(parsedTurn);
      } catch(e) {
        throw e;
      }
    }
  }

  private tryParseLine(line: string): NavigationTurn | void {
    line = line.trim().toLowerCase();
    if (line == "") return;
    const regexTest = /^(up|down|forward)\s(-?\d+)$/;

    if (!regexTest.test(line)) {
      throw new Error(`Invalid line: ${line}`);
      return;
    }

    const matches = line.match(regexTest);

    if (matches == null || matches.length < 3) {
      throw new Error(`Invalid line: ${line}`);
    }

    let turn: NavigationTurn = {
      instruction: Instruction.Forward,
      delta: parseInt(matches[2] ?? ""),
    };

    if (turn.delta == undefined || Number.isNaN(turn.delta)) {
      throw new Error(`Invalid delta: ${matches[2]}`);
    }

    switch (matches[1]) {
      case "forward":
        turn.instruction = Instruction.Forward;
        break;
      case "up":
        turn.instruction = Instruction.Up;
        break;
      case "down":
        turn.instruction = Instruction.Down;
        break;
      default:
        throw new Error(`Invalid instruction: ${matches[1]}`);
        return;
    }

    return turn;
  }
}

function processFile(filename: string): string[] | null {
  let lines: string[] = [];

  try {
    const data = fs.readFileSync(filename, "utf8");
    lines = data.split(/\r?\n/);
    return lines;
  } catch (e) {
    console.error("Error reading file", e);
    return null;
  }
}

const cliOptions = {
  options: {
    input: { type: 'string', short: 'i' },
    mode: { type: 'string', short: 'm', default: '1' },
  }
} as const;

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { values } = parseArgs(cliOptions);

  if (!values.input) {
    console.error("Input file must be provided (--input or -i, ex. `npm run start -- --input ./inputs/input.txt`)");
  } else {
    const lines = processFile(values.input);
    if (!lines) {
      console.error("Unable to provide instructions to submarine.");
    } else { 
      const navigationSheet = new NavigationSheet(lines);

      try {
        if (!["1", "2"].includes(values.mode)) {
          console.error("Invalid mode supplied, defaulting to Phase 1\n");
        }

        const sub = new Sub((values.mode == "2" ? Phase.Kata2 : Phase.Kata1));
        sub.navigate(navigationSheet);
        sub.printCoordinates();      
      } catch (e) {
        console.error("The sub ran into an issue!", e);
      }
    }
  }
}