import { readFileSync } from 'fs';

export default function day5() {
    const input = readFileSync('./day5/input.txt', { encoding: 'utf8' });
    const lines = input.split('\n');

    const stackCount = 3;
    const maxStackHeight = 3;
    const stacks = [];
    for (let i = 0; i < stackCount; i++) {
        stacks[i] = [];
        for (let j = maxStackHeight - 1; j >= 0; j--) {
            const c = lines[j][1 + i * 4];
            if (c !== ' ') {
                stacks[i].push(c);
            }
        }
    }

    const moves = lines.slice(maxStackHeight + 2).map((line) => {
        const [count, from, to] = line.match(/move (\d) from (\d) to (\d)/).slice(1).map(Number);
        return {
            count,
            from,
            to
        };
    });


    console.log(moves);

}