import { readFileSync } from 'fs';

const fullyContains = (a, b) => (
    (a.start <= b.start && a.end >= b.end) ||
    (b.start <= a.start && b.end >= a.end)
);

const overlaps = (a, b) => (
    (a.start <= b.start && a.end >= b.start) ||
    (b.start <= a.start && b.end >= a.start)
);

export default function day4() {
    const input = readFileSync('./day4/input.txt', { encoding: 'utf8' });

    const pairs = input.split('\n').map((line) => {
        const [startA, endA, startB, endB] =
            line.match(/^(\d+)-(\d+),(\d+)-(\d+)$/).slice(1).map(Number);

        return [
            { start: startA, end: endA },
            { start: startB, end: endB },
        ];
    });

    const fullyContainedPairs = pairs.filter(pair => fullyContains(...pair));
    const overlappingPairs = pairs.filter(pair => overlaps(...pair));

    console.log(`Answer part 1: ${fullyContainedPairs.length}`);
    console.log(`Answer part 2: ${overlappingPairs.length}`);
}