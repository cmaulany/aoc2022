import { readFileSync } from 'fs';

function copyStacks(stacks) {
    return stacks.map((stack) => stack.slice());
}

function tick(stacks, move, flipOrder = false) {
    stacks = copyStacks(stacks);

    const temp = [];
    for (let i = 0; i < move.count; i++) {
        const crate = stacks[move.from - 1].pop();
        temp.push(crate);
    }
    const flipped = flipOrder ? temp.reverse() : temp;
    stacks[move.to - 1].push(...flipped);

    return stacks;
}

export default function day5() {
    const input = readFileSync('./day5/input.txt', { encoding: 'utf8' });
    const lines = input.split('\n');

    const stackCount = 9;
    const maxStackHeight = 8;
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
        const [count, from, to] = line.match(/move (\d+) from (\d) to (\d)/).slice(1).map(Number);
        return {
            count,
            from,
            to
        };
    });

    const finalState9000 = moves.reduce((stacks, move) => tick(stacks, move, false), stacks);
    const finalState9001 = moves.reduce((stacks, move) => tick(stacks, move, true), stacks);

    const result9000 = finalState9000.map((stack) => stack.pop()).join('');
    const result9001 = finalState9001.map((stack) => stack.pop()).join('');

    console.log(`Answer part 1: ${result9000}`);
    console.log(`Answer part 2: ${result9001}`);
}