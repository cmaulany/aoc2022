import { readFileSync } from 'fs';

const toKey = ({ x, y }) => `${x},${y}`;

function mod(value, modulo) {
    const rem = value %= modulo;
    return rem < 0 ? rem + modulo : rem;
}

const deltas = {
    '>': { x: 1, y: 0 },
    'v': { x: 0, y: 1 },
    '<': { x: -1, y: 0 },
    '^': { x: 0, y: -1 },
};

const moveBlizzards = (blizzards, width, height, t = 1) => blizzards.map((blizzard) => {
    const { x, y, char } = blizzard;
    const delta = deltas[char];
    return {
        ...blizzard,
        x: mod(x + delta.x * t - 1, width - 2) + 1,
        y: mod(y + delta.y * t - 1, height - 2) + 1,
    };
});

const cache = {};
const getBlizzardMap = (blizzards, width, height, t) => {
    if (cache[t]) {
        return cache[t];
    }

    const nextBlizzards = moveBlizzards(blizzards, width, height, t);
    const blizzardMap = {};
    nextBlizzards.forEach((blizzard) => blizzardMap[toKey(blizzard)] = blizzard);
    cache[t] = blizzardMap;
    return blizzardMap;
}

const getNeighbors = ({ x, y }) => [
    { x: x + 1, y },
    { x, y: y + 1 },
    { x: x - 1, y },
    { x, y: y - 1 },
];

function getTime(state, end) {
    const open = [state];
    const visited = {};
    while (open.length > 0) {
        const current = open.shift();
        const { map, blizzards, position, time, width, height } = current;

        const key = [time, position.x, position.y].join(',');
        if (visited[key]) {
            continue;
        }
        visited[key] = true;

        if (position.x === end.x && position.y === end.y) {
            return time;
        }

        const blizzardMap = getBlizzardMap(blizzards, width, height, time + 1);

        const neighbors = getNeighbors(position).filter(({ x, y }) =>
            x >= 0 && x < width &&
            y >= 0 && y < height &&
            map[y][x] !== '#' &&
            !blizzardMap[toKey({ x, y })]
        );

        if (!blizzardMap[toKey(position)]) {
            neighbors.push(position);
        }

        open.push(...neighbors.map((neighbor) => ({
            ...current,
            time: time + 1,
            position: neighbor,
        })));
    }
}


export default function day24() {
    const input = readFileSync('./day24/input.txt', { encoding: 'utf8' });

    const map = input.split('\n').map((line) => line.split(''));

    const blizzards = input.split('\n')
        .flatMap((line, y) => line.split('').map((char, x) => ({ x, y, char })))
        .filter(({ char }) => ['>', 'v', '<', '^'].includes(char));

    const width = map[0].length;
    const height = map.length;

    const state = {
        map,
        blizzards,
        width,
        height,
        time: 0,
        position: { x: 1, y: 0 }
    };

    const res = getTime(state, { x: width - 2, y: height - 1 });
    console.log(res);

    const state2 = {
        map,
        blizzards,
        width,
        height,
        time: res,
        position: { x: width - 2, y: height - 1 }
    }
    const res2 = getTime(state2, { x: 1, y: 0 });
    console.log(res2);

    const state3 = {
        map,
        blizzards,
        width,
        height,
        time: res2,
        position: { x: 1, y: 0 }
    }
    const res3 = getTime(state3, { x: width - 2, y: height - 1 });
    console.log(res3);
}