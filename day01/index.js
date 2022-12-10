import { readFileSync } from 'fs';

export default function day1() {
    const input = readFileSync('./day01/input.txt', { encoding: 'utf8' });
    
    const elves = input.split('\n\n').map((elfInput) => elfInput.split('\n').map(Number));
    
    const sum = (numbers) => numbers.reduce((sum, n) => sum + n, 0);
    
    const elfSums = elves.map(sum).sort((a, b) => a < b ? 1 : -1);
    
    const maxElfSum = elfSums[0];
    const topThreeElvesSum = sum(elfSums.slice(0, 3));

    console.log(`Answer part 1: ${maxElfSum}`);
    console.log(`Answer part 2: ${topThreeElvesSum}`);
}