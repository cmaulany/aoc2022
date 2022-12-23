import { readFileSync } from 'fs';

const toKey = (elf) => `${elf.x},${elf.y}`;

const mapBy = (elves, toKey) => elves.reduce((map, elf) => {
    map[toKey(elf)] = elf;
    return map;
}, {});

const groupBy = (list, toKey) => list.reduce((groups, item) => {
    const key = toKey(item);
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
}, {});

function proposeMove(elfMap, elf, moves) {
    const { x, y } = elf;
    const move = moves.find(
        (move) => move.checks.every(
            ({ x: dx, y: dy }) =>
                !elfMap[toKey({ x: x + dx, y: y + dy })]
        )
    );

    if (!move) {
        return { ...elf, x, y };
    }

    return {
        ...elf,
        x: x + move.delta.x,
        y: y + move.delta.y
    };
}

function getNextElves(elves, round) {
    const moves = [{
        checks: [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 1 },
            { x: -1, y: 1 },
            { x: -1, y: 0 },
            { x: -1, y: -1 },
            { x: 0, y: -1 },
            { x: 1, y: -1 },
        ],
        delta: { x: 0, y: 0 }
    }];

    const consideredMoves = [
        {
            checks: [
                { x: -1, y: -1 },
                { x: 0, y: -1 },
                { x: 1, y: -1 },
            ],
            delta: { x: 0, y: -1 }
        },
        {
            checks: [
                { x: -1, y: 1 },
                { x: 0, y: 1 },
                { x: 1, y: 1 },
            ],
            delta: { x: 0, y: 1 }
        },
        {
            checks: [
                { x: -1, y: -1 },
                { x: -1, y: 0 },
                { x: -1, y: 1 },
            ],
            delta: { x: -1, y: 0 }
        },
        {
            checks: [
                { x: 1, y: -1 },
                { x: 1, y: 0 },
                { x: 1, y: 1 },
            ],
            delta: { x: 1, y: 0 }
        },
    ];

    for (let i = 0; i < consideredMoves.length; i++) {
        moves.push(consideredMoves[(round + i) % consideredMoves.length]);
    }

    const elfMap = mapBy(elves, toKey);
    const proposedMoves = Object.values(elves).map((elf) => {
        return {
            from: elf,
            to: proposeMove(elfMap, elf, moves)
        };
    });

    const groups = groupBy(proposedMoves, (elf) => toKey(elf.to));

    const nextElves = Object.values(groups).flatMap((group) =>
        group.map((proposedMove) =>
            group.length === 1 ?
                proposedMove.to :
                proposedMove.from
        )
    );

    return nextElves;
}

function runTillDone(elves) {
    let round = 0;
    let previousRendered;
    let rendered = render(elves);
    while (rendered !== previousRendered) {
        elves = getNextElves(elves, round)
        previousRendered = rendered;
        rendered = render(elves);
        round++;
    }

    return { round, elves, rendered };
}

function render(elves) {
    const elfMap = mapBy(elves, toKey);
    const xs = elves.map((elf) => elf.x);
    const ys = elves.map((elf) => elf.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const lines = [];
    for (let y = minY; y <= maxY; y++) {
        const line = [];
        for (let x = minX; x <= maxX; x++) {
            line.push(elfMap[toKey({ x, y })] ? '#' : '.');
        }
        lines.push(line.join(''));
    }
    return lines.join('\n');
}

export default function day23() {
    const input = readFileSync('./day23/input.txt', { encoding: 'utf8' });

    const elves = input
        .split('\n')
        .map((line) => line.trim().split(''))
        .flatMap((row, y) => row.map((char, x) => ({ char, x, y })))
        .filter(({ char }) => char === '#');

    const elvesRound10 = Array.from({ length: 10 }).reduce(
        (elves, _, round) => getNextElves(elves, round),
        elves
    );
    const emptyTileCount = render(elvesRound10).split('').filter((c) => c === '.').length;
    console.log(`Answer part 1: ${emptyTileCount}`);

    const finalState = runTillDone(elves);
    console.log(`Answer part 2: ${finalState.round}`);
}