import { readFileSync } from 'fs';

function toKey(square) {
    return `${square.x},${square.y}`;
}

function getNeighbors(map, square) {
    const deltas = [
        { x: 0, y: - 1 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 }
    ]
    const positions = deltas
        .map((delta) => ({
            x: delta.x + square.x,
            y: delta.y + square.y
        }))
        .filter((position) =>
            position.y >= 0 &&
            position.y < map.length &&
            position.x >= 0 &&
            position.x < map[0].length
        );
    return positions.map(({ x, y }) => map[y][x]);
}

function findPath(map, start, end) {
    const startKey = toKey(start);
    const toVisit = [start];
    const cameFrom = {};
    const scores = { [startKey]: 0 };

    while (toVisit.length > 0) {
        const current = toVisit.shift();
        const currentKey = toKey(current);
        const currentScore = scores[currentKey];

        const neighbors = getNeighbors(map, current);
        const eligibleNeighbors = neighbors.filter(
            (neighbor) => neighbor.height <= current.height + 1
        );

        eligibleNeighbors.forEach((neighbor) => {
            const neighborKey = toKey(neighbor);
            const neighborScore = currentScore + 1;
            if (
                !scores.hasOwnProperty(neighborKey) ||
                neighborScore < scores[neighborKey]
            ) {
                cameFrom[neighborKey] = currentKey;
                scores[neighborKey] = neighborScore;
                toVisit.push(neighbor);
            }
        });
    }

    let pathKey = toKey(end);
    if (!cameFrom[pathKey]) {
        return null;
    }

    const path = [];
    while (pathKey !== toKey(start)) {
        path.unshift(pathKey);
        pathKey = cameFrom[pathKey];
    }

    return path;
}

export default function day12() {
    const input = readFileSync('./day12/input.txt', { encoding: 'utf8' });

    const map = input.split('\n').map((line, y) => line.split('').map((symbol, x) => {
        const isStart = symbol === 'S';
        const isEnd = symbol === 'E';
        symbol = isStart ? 'a' : isEnd ? 'z' : symbol;
        const height = symbol.charCodeAt(0) - 'a'.charCodeAt(0);

        return {
            x,
            y,
            symbol,
            height,
            isStart,
            isEnd,
        };
    }));

    const start = map.flat().find((square) => square.isStart);
    const end = map.flat().find((square) => square.isEnd);

    const defaultPath = findPath(map, start, end);
    console.log(`Answer part 1: ${defaultPath.length}`);

    const starts = map.flat().filter((square) => square.symbol === 'a');
    const distances = starts
        .map((start) => findPath(map, start, end))
        .filter((path => path !== null))
        .map((path) => path.length);
    const bestDistance = Math.min(...distances);
    console.log(`Answer part 2: ${bestDistance}`);
}