import { readFileSync } from 'fs';

function add(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
    };
}

function move(state, move) {
    const { direction, distance } = move;
    const { visited, rope } = state;

    const delta = {
        'U': { x: 0, y: -1 },
        'R': { x: 1, y: 0 },
        'D': { x: 0, y: 1 },
        'L': { x: -1, y: 0 }
    }[direction];

    let newRope = rope;
    for (let i = 0; i < distance; i++) {
        newRope[0] = add(newRope[0], delta);
        for (let j = 1; j < newRope.length; j++) {
            const current = newRope[j];
            const previous = newRope[j - 1];

            const dx = previous.x - current.x;
            const dy = previous.y - current.y;
            if (
                Math.abs(dx) > 1 ||
                Math.abs(dy) > 1
            ) {
                newRope[j] = add(
                    current,
                    {
                        x: Math.sign(dx),
                        y: Math.sign(dy),
                    }
                );
            }
        }
        const tail = newRope[newRope.length - 1];
        visited[`${tail.x},${tail.y}`] = true;
    }

    return {
        rope: newRope,
        visited,
    };
}

export default function day9() {
    const input = readFileSync('./day9/input.txt', { encoding: 'utf8' });

    const moves = input.split('\n').map((line) => {
        const [direction, distance] = line.split(' ');
        return {
            direction,
            distance: Number(distance),
        };
    });

    const initializeState = (ropeLength) => ({
        rope: Array.from({ length: ropeLength }).map(() => ({ x: 0, y: 0 })),
        visited: { '0,0': true },
    });

    const finalStateLength2 = moves.reduce(move, initializeState(2));
    const finalStateLength10 = moves.reduce(move, initializeState(10));

    const visitedPositionsLength2 = Object.keys(finalStateLength2.visited).length;
    const visitedPositionsLength10 = Object.keys(finalStateLength10.visited).length;

    console.log(`Answer part 1: ${visitedPositionsLength2}`);
    console.log(`Answer part 2: ${visitedPositionsLength10}`);
}