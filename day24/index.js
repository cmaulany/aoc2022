import { readFileSync } from 'fs';

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
    nextBlizzards.forEach(({ x, y }) => blizzardMap[`${x},${y}`] = true);
    cache[t] = blizzardMap;
    return blizzardMap;
}

const getNeighbors = ({ x, y }) => [
    { x: x + 1, y },
    { x, y: y + 1 },
    { x: x - 1, y },
    { x, y: y - 1 },
];

function findPath(state, end) {
    const open = [state];
    const visited = {};
    while (open.length > 0) {
        const current = open.shift();
        const { map, position, blizzards, time, width, height } = current;

        const key = [time, position.x, position.y].join(',');
        // console.log(key);
        if (visited[key]) {
            continue;
        }
        visited[key] = true;

        if (position.x === end.x && position.y === end.y) {
            return time;
        }

        const blizzardMap = getBlizzardMap(blizzards, width, height, time + 1);

        // const nextBlizzards = moveBlizzards(blizzards, width, height);
        // const blizzardMap = {};
        // nextBlizzards.forEach(({ x, y }) => blizzardMap[`${x},${y}`] = true);

        const neighbors = getNeighbors(position).filter(
            ({ x, y }) =>
                x >= 0 && x < width &&
                y >= 0 && y < height &&
                map[y][x] !== '#' &&
                !blizzardMap[`${x},${y}`]
            // nextBlizzards.every((blizzard) => blizzard.x !== x || blizzard.y !== y)
        );
        // console.log(position, blizzards);


        if (
            !blizzardMap[`${position.x},${position.y}`]
            // nextBlizzards.every((blizzard) =>
            //     blizzard.x !== position.x ||
            //     blizzard.y !== position.y
            // )
        ) {
            neighbors.push(position);
        }

        open.push(...neighbors.map((neighbor) => ({
            ...current,
            time: time + 1,
            // blizzards: nextBlizzards,
            position: neighbor,
        })));
    }
    console.log("NO");
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

    const res = findPath(state, { x: width - 2, y: height - 1 });
    console.log(res);

    // const nextBlizzards = moveBlizzards(blizzards, width, height, 1);

    // console.log(blizzards);
    // console.log(nextBlizzards);
}