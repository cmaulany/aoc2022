import { readFileSync } from 'fs';

function calculateFinalSandUnitPosition(grid, startPosition) {
    let deltas = [
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
            .find((position) => !grid[`${position.x},${position.y}`]);

        if (!nextPosition) {
            return position;
        }

        if (nextPosition.y > 1000) {
            return null;
        }

        position = nextPosition;
    }
}

function pourSandUnit(state, position) {
    const { grid } = state;
    const finalPosition = calculateFinalSandUnitPosition(grid, position);
    if (!finalPosition) {
        return {
            ...state,
            isFinished: true,
        };
    }

    return {
        ...state,
        grid: {
            ...grid,
            [`${finalPosition.x},${finalPosition.y}`]: 'sand'
        },
    };
}

export default function day14() {
    const input = readFileSync('./day14/input.txt', { encoding: 'utf8' });
    const paths = input.split('\n').map((line) => line.split(' -> ').map((position) => {
        const [x, y] = position.split(',').map(Number);
        return { x, y };
    }))

    const grid = {};
    paths.forEach((path) => {
        grid[`${path[0].x},${path[0].y}`] = 'wall';
        for (let i = 1; i < path.length; i++) {
            const from = path[i - 1];
            const to = path[i];
            const delta = {
                x: Math.sign(to.x - from.x),
                y: Math.sign(to.y - from.y)
            };

            let position = from;
            do {
                position = {
                    x: position.x + delta.x,
                    y: position.y + delta.y
                };
                grid[`${position.x},${position.y}`] = 'wall';
            } while (position.x !== to.x || position.y !== to.y)
        }
    });

    let state = {
        isFinished: false,
        grid
    };
    while (!state.isFinished) {
        state = pourSandUnit(state, { x: 500, y: 0 });
    }

    const count = Object.values(state.grid).filter((cell) => cell === 'sand');
    console.log(count.length);
}