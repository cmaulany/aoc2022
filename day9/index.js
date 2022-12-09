import { readFileSync } from 'fs';

function add(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
    };
}

function move(state, move) {
    const { direction, distance } = move;
    const { visited, head, tail } = state;

    const delta = {
        'U': { x: 0, y: -1 },
        'R': { x: 1, y: 0 },
        'D': { x: 0, y: 1 },
        'L': { x: -1, y: 0 }
    }[direction];

    let h = head;
    let t = tail;
    for (let i = 0; i < distance; i++) {
        console.log(i, h, t);
        h = add(h, delta);
        // const check = Math.abs(h.x - t.x) > 1 ||
        //     Math.abs(h.y - t.y) > 1;
        if (
            Math.abs(h.x - t.x) > 1 ||
            Math.abs(h.y - t.y) > 1
        ) {
            console.log("moving", Math.sign(h.x - t.x), Math.sign(h.y - t.y))
            t = add(
                t,
                {
                    x: Math.sign(h.x - t.x),
                    y: Math.sign(h.y - t.y),
                }
            );
            const key = `${t.x},${t.y}`;
            visited[key] ??= 0;
            visited[key]++;
        }

    }

    return {
        head: h,
        tail: t,
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

    const initialState = {
        head: { x: 0, y: 0 },
        tail: { x: 0, y: 0 },
        visited: { '0,0': 1 },
    };

    console.log(moves);
    const finalState = moves.reduce(move, initialState);
    console.log(finalState);

    console.log(Object.keys(finalState.visited).length);
}