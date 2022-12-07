import day1 from './day1/index.js';
import day2 from './day2/index.js';
import day3 from './day3/index.js';
import day4 from './day4/index.js';
import day5 from './day5/index.js';
import day6 from './day6/index.js';
import day7 from './day7/index.js';

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
}[dayArg];

if (!day) {
    throw new Error(`Could not find day ${dayArg}.`);
}

console.log(`--Day ${dayArg}--`);
day();