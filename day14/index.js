import { readFileSync } from 'fs';

const toKey = (position) => `${position.x},${position.y}`;

function getFinalSandUnitPosition(state, startPosition) {
    const { grid, maxY, floorY } = state;

    if (grid[toKey(startPosition)]) {
        return null;
    }

    const deltas = [
        { x: 0, y: 1 },
        { x: -1, y: 1 },
        { x: 1, y: 1 },
    ];

    let position = startPosition;
    while (true) {
        const nextPosition = deltas
            .map((delta) => ({
                x: position.x + delta.x,
                y: position.y + delta.y,
            }))
            .find((position) =>
                !grid[toKey(position)] &&
                (floorY === undefined || position.y < floorY)
            );

        if (!nextPosition) {
            return position;
        }

        if (nextPosition.y > maxY) {
            return null;
        }

        position = nextPosition;
    }
}

function pourSandUnit(state, position) {
    const { grid } = state;
    const finalPosition = getFinalSandUnitPosition(state, position);

    if (!finalPosition) {
        return {
            ...state,
            isFinished: true,
        };
    }

    grid[toKey(finalPosition)] = 'sand';
    return state;
}

function getFinalState(state) {
    state = { ...state, grid: { ...state.grid } };
    while (!state.isFinished) {
        state = pourSandUnit(state, { x: 500, y: 0 });
    }
    return state;
}

function drawWall(grid, path) {
    const newGrid = { ...grid };
    newGrid[toKey(path[0])] = 'wall';
    for (let i = 1; i < path.length; i++) {
        const from = path[i - 1];
        const to = path[i];
        const delta = {
            x: Math.sign(to.x - from.x),
            y: Math.sign(to.y - from.y),
        };

        let position = from;
        do {
            position = {
                x: position.x + delta.x,
                y: position.y + delta.y,
            };
            newGrid[toKey(position)] = 'wall';
        } while (position.x !== to.x || position.y !== to.y)
    }
    return newGrid;
}

export default function day14() {
    const input = readFileSync('./day14/input.txt', { encoding: 'utf8' });
    const paths = input.split('\n').map((line) => line.split(' -> ').map((position) => {
        const [x, y] = position.split(',').map(Number);
        return { x, y };
    }));

    const grid = paths.reduce(drawWall, {});
    const maxY = Math.max(...paths.flat().map(({ y }) => y));

    const countSand = (state) => Object.values(state.grid).filter((cell) => cell === 'sand').length;

    const initialAbyssState = { grid, maxY };
    const finalAbyssState = getFinalState(initialAbyssState);
    const abyssSandCount = countSand(finalAbyssState);
    console.log(`Answer part 1: ${abyssSandCount}`);

    const initialFloorState = { grid, floorY: maxY + 2 };
    const finalFloorState = getFinalState(initialFloorState);
    const floorSandCount = countSand(finalFloorState);
    console.log(`Answer part 2: ${floorSandCount}`);
}