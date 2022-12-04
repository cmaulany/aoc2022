import day1 from './day1/index.js';
import day2 from './day2/index.js';
import day3 from './day3/index.js';
import day4 from './day4/index.js';

const dayArg = process.argv[2];
if (dayArg === undefined) {
    throw new Error('Usage: npm run day <day number>.');
}

const day = {
    '1': day1,
    '2': day2,
    '3': day3,
    '4': day4,
}[dayArg];

if (!day) {
    throw new Error(`Could not find day ${dayArg}.`);
}

console.log(`--Day ${dayArg}--`);
day();