import { readFileSync } from 'fs';

const toKey = ({ x, y }) => `${x},${y}`;

function mod(value, modulo) {
    const rem = value %= modulo;
    return rem < 0 ? rem + modulo : rem;
}

const getNeighbors = ({ x, y }) => [
    { x: x + 1, y },
    { x, y: y + 1 },
    { x: x - 1, y },
    { x, y: y - 1 },
];

const moveBlizzards = (blizzards, width, height, t) => blizzards.map((blizzard) => {
    const { x, y, char } = blizzard;
    const delta = {
        '>': { x: 1, y: 0 },
        'v': { x: 0, y: 1 },
        '<': { x: -1, y: 0 },
        '^': { x: 0, y: -1 },
    }[char];
    return {
        ...blizzard,
        x: mod(x + delta.x * t - 1, width - 2) + 1,
        y: mod(y + delta.y * t - 1, height - 2) + 1,
    };
});

function getBlizzardMap(blizzards, width, height, time, cache = {}) {
    if (cache[time]) {
        return cache[time];
    }

    const nextBlizzards = moveBlizzards(blizzards, width, height, time);
    const blizzardMap = {};
    nextBlizzards.forEach((blizzard) => blizzardMap[toKey(blizzard)] = blizzard);
    cache[time] = blizzardMap;
    return blizzardMap;
}

function getMinTime(state, end) {
    const open = [state];
    const visited = {};
    const cache = {};
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

        const blizzardMap = getBlizzardMap(blizzards, width, height, time + 1, cache);

        const nextPositions = getNeighbors(position).filter(({ x, y }) =>
            x >= 0 && x < width &&
            y >= 0 && y < height &&
            map[y][x] !== '#' &&
            !blizzardMap[toKey({ x, y })]
        );

        if (!blizzardMap[toKey(position)]) {
            nextPositions.push(position);
        }

        open.push(...nextPositions.map((neighbor) => ({
            ...current,
            time: time + 1,
            position: neighbor,
        })));
    }
}

function getMinPathTime(state, path) {
    path.forEach((node) => {
        const time = getMinTime(state, node);
        state = { ...state, position: node, time };
    });
    return state.time;
}

export default function day24() {
    const input = readFileSync('./day24/input.txt', { encoding: 'utf8' });
    const map = input.split('\n').map((line) => line.split(''));
    const blizzards = input.split('\n')
        .flatMap((line, y) => line.split('').map((char, x) => ({ x, y, char })))
        .filter(({ char }) => ['>', 'v', '<', '^'].includes(char));

    const width = map[0].length;
    const height = map.length;

    const start = { x: 1, y: 0 };
    const end = { x: width - 2, y: height - 1 };

    const state = {
        map,
        blizzards,
        width,
        height,
        time: 0,
        position: start,
    };

    const timeToEnd = getMinTime(state, end);
    console.log(`Answer part 1: ${timeToEnd}`);

    const timeRoundTrip = getMinPathTime(state, [end, start, end]);
    console.log(`Answer part 2: ${timeRoundTrip}`);
}