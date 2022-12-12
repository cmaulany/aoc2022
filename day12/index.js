import { readFileSync } from 'fs';

function getNeighbors(map, square) {
    const deltas = [
        { x: 0, y: - 1 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 }
    ];
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
    const toVisit = [start];
    const cameFrom = {};
    const scores = { [start.key]: 0 };

    while (toVisit.length > 0) {
        const current = toVisit.shift();
        const currentScore = scores[current.key];

        const eligibleNeighbors = getNeighbors(map, current).filter(
            (neighbor) => neighbor.height <= current.height + 1
        );

        eligibleNeighbors.forEach((neighbor) => {
            const neighborScore = currentScore + 1;
            if (
                !scores.hasOwnProperty(neighbor.key) ||
                neighborScore < scores[neighbor.key]
            ) {
                cameFrom[neighbor.key] = current.key;
                scores[neighbor.key] = neighborScore;
                toVisit.push(neighbor);
            }
        });
    }

    let cameFromKey = end.key;
    if (!cameFrom[cameFromKey]) {
        return null;
    }

    const path = [];
    while (cameFromKey !== start.key) {
        path.unshift(cameFromKey);
        cameFromKey = cameFrom[cameFromKey];
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
        const key = `${x},${y}`;

        return {
            x,
            y,
            key,
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
        .filter((path) => path !== null)
        .map((path) => path.length);
    const minDistance = Math.min(...distances);
    console.log(`Answer part 2: ${minDistance}`);
}