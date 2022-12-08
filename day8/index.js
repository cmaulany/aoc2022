import { readFileSync } from 'fs';

function viewingDistance(trees, position, direction) {
    if (
        (direction === 'up' && position.y <= 0) ||
        (direction === 'down' && position.y >= trees.length - 1) ||
        (direction === 'left' && position.x <= 0) ||
        (direction === 'right' && position.x >= trees[0].length - 1)
    ) {
        return {
            distance: 0,
            isInfinite: true
        };
    }

    const delta = {
        up: { x: 0, y: -1 },
        right: { x: 1, y: 0 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 }
    }[direction];

    const tree = trees[position.y][position.x];

    let distance = 0;
    let isInner;
    do {
        distance++;
        position = {
            x: position.x + delta.x,
            y: position.y + delta.y
        };
        isInner =
            position.y > 0 &&
            position.y < trees.length - 1 &&
            position.x > 0 &&
            position.x < trees[0].length - 1;
    } while (
        isInner &&
        trees[position.y][position.x] < tree
    )

    const isInfinite =
        !isInner && (
            typeof trees[position.y]?.[position.x] !== 'number' ||
            trees[position.y][position.x] < tree
        );

    return {
        distance,
        isInfinite
    };
}

export default function day8() {
    const input = readFileSync('./day8/input.txt', { encoding: 'utf8' });
    const trees = input.split('\n').map((line) => line.split('').map(Number));

    const visibilityMap = [];
    for (let y = 0; y < trees.length; y++) {
        visibilityMap[y] = [];
        for (let x = 0; x < trees[0].length; x++) {
            const position = { x, y };
            visibilityMap[y][x] =
                viewingDistance(trees, position, 'up').isInfinite ||
                viewingDistance(trees, position, 'down').isInfinite ||
                viewingDistance(trees, position, 'left').isInfinite ||
                viewingDistance(trees, position, 'right').isInfinite;
        }
    }

    const visibleTreeCount = visibilityMap.flat().filter((visible) => visible).length;
    console.log(`Answer part 1: ${visibleTreeCount}`);

    const scenicScoreMap = [];
    for (let y = 0; y < trees.length; y++) {
        scenicScoreMap[y] = [];
        for (let x = 0; x < trees[0].length; x++) {
            const position = { x, y };
            scenicScoreMap[y][x] =
                viewingDistance(trees, position, 'up').distance *
                viewingDistance(trees, position, 'down').distance *
                viewingDistance(trees, position, 'left').distance *
                viewingDistance(trees, position, 'right').distance;
        }
    }

    const max = scenicScoreMap.flat().reduce((max, score) => Math.max(max, score), 0);
    console.log(`Answer part 2: ${max}`);
}