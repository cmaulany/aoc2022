import { readFileSync } from 'fs';

function move(state, move) {
    const { direction, distance } = move;
    const { visited, rope } = state;

    let newRope = rope;
    let newVisited = { ...visited };
    for (let i = 0; i < distance; i++) {
        newRope = moveRope(newRope, direction);

        const tail = newRope[newRope.length - 1];
        newVisited[`${tail.x},${tail.y}`] = true;
    }

    return {
        rope: newRope,
        visited: newVisited,
    };
}

function moveRope(rope, direction) {
    const newRope = rope.slice();

    const delta = {
        'U': { x: 0, y: -1 },
        'R': { x: 1, y: 0 },
        'D': { x: 0, y: 1 },
        'L': { x: -1, y: 0 }
    }[direction];

    const head = newRope[0];
    newRope[0] = {
        x: head.x + delta.x,
        y: head.y + delta.y
    };

    for (let i = 1; i < newRope.length; i++) {
        const current = newRope[i];
        const previous = newRope[i - 1];

        const dx = previous.x - current.x;
        const dy = previous.y - current.y;
        if (
            Math.abs(dx) > 1 ||
            Math.abs(dy) > 1
        ) {
            newRope[i] = {
                x: current.x + Math.sign(dx),
                y: current.y + Math.sign(dy),
            }
        }
    }

    return newRope;
}

export default function day9() {
    const input = readFileSync('./day09/input.txt', { encoding: 'utf8' });

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