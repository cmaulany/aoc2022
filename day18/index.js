import { readFileSync } from 'fs';

const getNeighbors = ([x, y, z]) => [
    [x - 1, y, z],
    [x + 1, y, z],
    [x, y - 1, z],
    [x, y + 1, z],
    [x, y, z - 1],
    [x, y, z + 1]
];

function getOuterCubesMap(cubes, min, max) {
    const isOuter = { [min]: cubes.hasOwnProperty(min) };
    const open = [min];
    while (open.length > 0) {
        const cube = open.shift();

        const newNeighbors = getNeighbors(cube).filter((neighbor) =>
            !isOuter.hasOwnProperty(neighbor) &&
            !cubes.hasOwnProperty(neighbor) &&
            neighbor.every(
                (value, i) =>
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

    const isLava = lavas.reduce((map, lava) => ({
        ...map,
        [lava]: true
    }), {});
    const edges = lavas.flatMap(getNeighbors).filter((neighbor) => !isLava[neighbor]);
    console.log(`Answer part 1: ${edges.length}`)

    const min = edges[0].map((_, i) => Math.min(...edges.map((edge) => edge[i])));
    const max = edges[0].map((_, i) => Math.max(...edges.map((edge) => edge[i])));

    const isOuter = getOuterCubesMap(isLava, min, max);
    const outerEdges = edges.filter((edge) => isOuter[edge]);
    console.log(`Answer part 2: ${outerEdges.length}`);
}