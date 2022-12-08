import { readFileSync } from 'fs';

function viewingDistance(trees, position, direction) {
    const delta = {
        up: { x: 0, y: - 1 },
        right: { x: 1, y: 0 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 }
    }[direction];

    const tree = trees[position.y][position.x];

    let distance = 0;
    do {
        distance++;
        position = {
            x: position.x + delta.x,
            y: position.y + delta.y
        };
    } while (
        position.y > 0 &&
        position.y < trees.length - 1 &&
        position.x > 0 &&
        position.x < trees[0].length - 1 &&
        trees[position.y][position.x] < tree
    )

    return distance;
}

export default function day8() {
    const input = readFileSync('./day8/input.txt', { encoding: 'utf8' });
    const trees = input.split('\n').map((line) => line.split('').map(Number));

    const map = trees.map((row) => row.map((n) => ({ height: n })));

    for (let y = 0; y < map.length; y++) {
        let max = -1;
        for (let x = 0; x < map[0].length; x++) {
            const tree = map[y][x];
            tree.leftMax = max;
            if (tree.height > max) {
                max = tree.height;
            }
        }
    }

    for (let y = 0; y < map.length; y++) {
        let max = -1;
        for (let x = map[0].length - 1; x >= 0; x--) {
            const tree = map[y][x];
            tree.rightMax = max;
            if (tree.height > max) {
                max = tree.height;
            }
        }
    }

    for (let x = 0; x < map[0].length; x++) {
        let max = -1;
        for (let y = 0; y < map.length; y++) {
            const tree = map[y][x];
            tree.topMax = max;
            if (tree.height > max) {
                max = tree.height;
            }
        }
    }

    for (let x = 0; x < map[0].length; x++) {
        let max = -1;
        for (let y = map.length - 1; y >= 0; y--) {
            const tree = map[y][x];
            tree.bottomMax = max;
            if (tree.height > max) {
                max = tree.height;
            }
        }
    }

    const visibleTrees = map.reduce((sum, row) => row.reduce((sum, tree) => {
        if (
            tree.leftMax < tree.height ||
            tree.topMax < tree.height ||
            tree.rightMax < tree.height ||
            tree.bottomMax < tree.height
        ) {
            return sum + 1;
        }
        return sum;
    }, sum), 0)

    console.log(`Answer part 1: ${visibleTrees}`);


    const score = trees.map((row) => row.map((n) => ({ height: n })));
    for (let y = 0; y < score.length; y++) {
        for (let x = 0; x < score[0].length; x++) {
            const position = { x, y };
            const s =
                viewingDistance(trees, position, 'up') *
                viewingDistance(trees, position, 'right') *
                viewingDistance(trees, position, 'down') *
                viewingDistance(trees, position, 'left')
            score[y][x] = s;
        }
    }

    const max = score.reduce((max, row) => row.reduce((max, score) => Math.max(max, score), max), 0);
    console.log(`Answer part 2: ${max}`);
}