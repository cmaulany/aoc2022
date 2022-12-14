import day1 from './day01/index.js';
import day2 from './day02/index.js';
import day3 from './day03/index.js';
import day4 from './day04/index.js';
import day5 from './day05/index.js';
import day6 from './day06/index.js';
import day7 from './day07/index.js';
import day8 from './day08/index.js';
import day9 from './day09/index.js';
import day10 from './day10/index.js';
import day11 from './day11/index.js';
import day12 from './day12/index.js';
import day13 from './day13/index.js';
import day14 from './day14/index.js';
import day15 from './day15/index.js';
import day16 from './day16/index.js';
import day17 from './day17/index.js';
import day18 from './day18/index.js';
import day19 from './day19/index.js';
import day20 from './day20/index.js';
import day21 from './day21/index.js';
import day22 from './day22/index.js';
import day23 from './day23/index.js';
import day24 from './day24/index.js';
import day25 from './day25/index.js';

const dayArg = process.argv[2];
if (dayArg === undefined) {
    throw new Error('Usage: npm run day <day number>.');
}

const day = {
    '1': day1,
    '2': day2,
    '3': day3,
    '4': day4,
    '5': day5,
    '6': day6,
    '7': day7,
    '8': day8,
    '9': day9,
    '10': day10,
    '11': day11,
    '12': day12,
    '13': day13,
    '14': day14,
    '15': day15,
    '16': day16,
    '17': day17,
    '18': day18,
    '19': day19,
    '20': day20,
    '21': day21,
    '22': day22,
    '23': day23,
    '24': day24,
    '25': day25,
}[dayArg];

if (!day) {
    throw new Error(`Could not find day ${dayArg}.`);
}

console.log(`--Day ${dayArg}--`);
day();