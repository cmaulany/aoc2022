import { readFileSync } from 'fs';

const getNeighbors = ([x, y, z]) => [
    [x - 1, y, z],
    [x + 1, y, z],
    [x, y - 1, z],
    [x, y + 1, z],
    [x, y, z - 1],
    [x, y, z + 1],
];

function getOuterMap(isBlocked, min, max) {
    const isOuter = { [min]: isBlocked[min] === true };
    const open = [min];
    while (open.length > 0) {
        const cube = open.shift();

        const newNeighbors = getNeighbors(cube).filter((neighbor) =>
            !isOuter.hasOwnProperty(neighbor) &&
            !isBlocked[neighbor] &&
            neighbor.every((value, i) =>
                value >= min[i] &&
                value <= max[i]
            )
        );

        newNeighbors.forEach((neighbor) => isOuter[neighbor] = true);
        open.push(...newNeighbors);
    }
    return isOuter;
}

export default function day18() {
    const input = readFileSync('./day18/input.txt', { encoding: 'utf8' });
    const lavas = input.split('\n').map((line) => line.split(',').map(Number));

    const isLava = lavas.reduce((map, lava) => ({ ...map, [lava]: true }), {});
    const edges = lavas.flatMap(getNeighbors).filter((neighbor) => !isLava[neighbor]);
    console.log(`Answer part 1: ${edges.length}`);

    const transposed = edges[0].map((_, i) => edges.map((row) => row[i]));
    const min = transposed.map((values) => Math.min(...values));
    const max = transposed.map((values) => Math.max(...values));

    const isOuter = getOuterMap(isLava, min, max);
    const outerEdges = edges.filter((edge) => isOuter[edge]);
    console.log(`Answer part 2: ${outerEdges.length}`);
}