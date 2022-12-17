import { readFileSync } from 'fs';

const blocksInput = `####

.#.
###
.#.

..#
..#
###

#
#
#
#

##
##`;

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

function tick(state) {
    const {
        blocks,
        blockIndex = 0,
        blockPosition,
        maxY = 0,
        jetIndex = 0,
        jets,
        action = 'spawn',
        width = 7,
        grid = {},
        rockCount = 0,
    } = state;

    if (action === 'spawn') {
        return {
            ...state,
            action: 'fall',
            blockPosition: {
                x: 2,
                y: maxY + 4 + blocks[blockIndex].length
            },
        };
    }

    const block = blocks[blockIndex];
    const jetX = jets[jetIndex] === '<' ? -1 : 1;
    const nextBlockPosition = action === 'push' ?
        {
            ...blockPosition,
            x: clamp(blockPosition.x + jetX, 0, width - block[0].length),
        } :
        {
            ...blockPosition,
            y: blockPosition.y - 1,
        };

    const isColliding = block.some((row, dy) =>
        row.some((symbol, dx) => {
            const x = nextBlockPosition.x + dx;
            const y = nextBlockPosition.y - dy;
            return y <= 0 || (symbol === '#' && grid[`${x},${y}`]);
        })
    );

    if (action === 'push') {
        return {
            ...state,
            action: 'fall',
            blockPosition: isColliding ? blockPosition : nextBlockPosition,
            jetIndex: (jetIndex + 1) % jets.length,
        };
    }

    if (action === 'fall' && isColliding) {
        const nextGrid = block.reduce((grid, row, dy) =>
            row.reduce((grid, symbol, dx) => {
                if (symbol === '#') {
                    const x = blockPosition.x + dx;
                    const y = blockPosition.y - dy;
                    grid[`${x},${y}`] = symbol;
                }
                return grid;
            }, grid),
            grid,
        );
        const nextIndex = (blockIndex + 1) % blocks.length;
        const nextMaxY = Math.max(maxY, blockPosition.y);
        return {
            ...state,
            action: 'spawn',
            blockIndex: nextIndex,
            grid: nextGrid,
            maxY: nextMaxY,
            rockCount: rockCount + 1,
        };
    }

    return {
        ...state,
        action: 'push',
        blockPosition: nextBlockPosition,
    };
}

function tickUntill(state, condition) {
    while (!condition(state)) {
        state = tick(state);
    }
    return state;
}

function findRepeatingPattern(grid) {
    const ys = Object.keys(grid).map((key) => Number(key.split(',')[1]));
    const maxY = Math.max(...ys);

    const chars = [];
    for (let y = 0; y < maxY; y++) {
        for (let x = 0; x < 7; x++) {
            chars.push(grid[`${x},${y}`] ?? '.');
        }
    };

    const match = chars.join('').match(/(.+?)\1+$/);
    if (!match) {
        return null;
    }

    const patternHeight = match[1].length / 7;
    const patternStart = match.index / 7;
    return {
        patternStart,
        patternHeight,
    }
}

function getHeightWithRockCount(state, rockCount) {
    const after10000RocksState = tickUntill(state, (state) => state.rockCount === 10000);

    const { patternHeight, patternStart } = findRepeatingPattern(after10000RocksState.grid);

    const nonRepeatingEndState = tickUntill(state, (state) => state.maxY === patternStart);
    const firstRepeat = tickUntill(nonRepeatingEndState, (state) => state.maxY === patternStart + patternHeight);
    const patternRockCount = firstRepeat.rockCount - nonRepeatingEndState.rockCount;

    const repeatCount = Math.floor((rockCount - nonRepeatingEndState.rockCount) / patternRockCount);
    const remainingRockCount = (rockCount - nonRepeatingEndState.rockCount) % patternRockCount;

    const offsetState = tickUntill(firstRepeat, (state) => state.rockCount === firstRepeat.rockCount + remainingRockCount);
    const offset = offsetState.maxY - firstRepeat.maxY;

    return nonRepeatingEndState.maxY + repeatCount * patternHeight + offset;
}

export default function day17() {
    const input = readFileSync('./day17/input.txt', { encoding: 'utf8' });

    const jets = input.split('');
    const blocks = blocksInput.split('\n\n').map((blockInput) => blockInput.split('\n').map((line) => line.split('')));

    const initialState = { jets, blocks };

    const after2022RocksState = tickUntill(initialState, (state) => state.rockCount === 2022);
    console.log(`Answer part 1: ${after2022RocksState.maxY}`);

    const finalHeight = getHeightWithRockCount(initialState, 1_000_000_000_000);
    console.log(`Answer part 2: ${finalHeight}`);
}