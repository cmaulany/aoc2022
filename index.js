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
}[dayArg];

if (!day) {
    throw new Error(`Could not find day ${dayArg}.`);
}

console.log(`--Day ${dayArg}--`);
day();