import day1 from "./day1/index.js";

const dayArg = process.argv[2];
if (dayArg === undefined) {
    throw new Error("Usage: npm run day <day number>.");
}

const day = {
    '1': day1
}[dayArg];

if (!day) {
    throw new Error(`Could not find day ${dayArg}.`);
}

console.log(`--Day ${dayArg}--`);
day();