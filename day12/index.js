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
    const toVisit = [start];
    const cameFrom = {};
    const gScore = { [toKey(start)]: 0 };
    while (toVisit.length > 0) {
        const square = toVisit.shift();
        const score = gScore[toKey(square)];

        const neighbors = getNeighbors(map, square);
        const eligibleNeighbors = neighbors.filter((neighbor) =>
            !gScore.hasOwnProperty(toKey(neighbor)) &&
            neighbor.height <= square.height + 1
        );

        eligibleNeighbors.forEach((neighbor) => {
            const key = toKey(neighbor);
            cameFrom[key] = toKey(square);
            gScore[key] = score + 1;
            toVisit.push(neighbor);
        });
    }

    if (cameFrom[end]) {
        return null;
    }

    // console.log(cameFrom);


    let x = toKey(end);
    const path = [];
    while (x) {
        path.unshift(x);
        x = cameFrom[x];
        // console.log(x);
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

    const path = findPath(map, start, end);
    // console.log(path);
    console.log(path.length - 1);

    const starts = map.flat().filter((square) => square.symbol === 'a');
    const distances = starts.map((start) => findPath(map, start, end).length - 1).filter((d => d > 0));
    const best = Math.min(...distances);
    console.log(best);
    // console.log(map, start, end);
}