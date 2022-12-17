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

const drawBlock = (grid, block, position) => block.reduce(
    (grid, row, dy) => row.reduce(
        (grid, symbol, dx) => {
            if (symbol === '#') {
                grid[`${position.x + dx},${position.y - dy}`] = symbol;
            }
            return grid;
        },
        grid
    ),
    grid
);

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
    const block = blocks[blockIndex];

    if (action === 'spawn') {
        return {
            ...state,
            action: 'fall',
            blockPosition: {
                x: 2,
                y: maxY + 4 + block.length
            },
        };
    }

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

    if (isColliding) {
        return {
            ...state,
            action: 'spawn',
            blockIndex: (blockIndex + 1) % blocks.length,
            grid: drawBlock(grid, block, blockPosition),
            maxY: Math.max(maxY, blockPosition.y),
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

function findRepeatingPattern(state) {
    const { grid, maxY } = state;

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

    const { patternHeight, patternStart } = findRepeatingPattern(after10000RocksState);

    const nonRepeatingEndState = tickUntill(state, (state) => state.maxY === patternStart);
    const firstRepeatState = tickUntill(
        nonRepeatingEndState,
        (state) => state.maxY === patternStart + patternHeight
    );
    const patternRockCount = firstRepeatState.rockCount - nonRepeatingEndState.rockCount;

    const repeatingRockCount = rockCount - nonRepeatingEndState.rockCount;
    const repeatCount = Math.floor(repeatingRockCount / patternRockCount);
    const remainingRockCount = repeatingRockCount % patternRockCount;

    const offsetState = tickUntill(firstRepeatState, (state) =>
        state.rockCount === firstRepeatState.rockCount + remainingRockCount
    );
    const offset = offsetState.maxY - firstRepeatState.maxY;

    return nonRepeatingEndState.maxY + repeatCount * patternHeight + offset;
}

export default function day17() {
    const input = readFileSync('./day17/input.txt', { encoding: 'utf8' });

    const jets = input.split('');
    const blocks = blocksInput.split('\n\n').map(
        (blockInput) => blockInput.split('\n').map((line) => line.split(''))
    );

    const initialState = { jets, blocks };

    const after2022RocksState = tickUntill(initialState, (state) => state.rockCount === 2022);
    console.log(`Answer part 1: ${after2022RocksState.maxY}`);

    const finalHeight = getHeightWithRockCount(initialState, 1_000_000_000_000);
    console.log(`Answer part 2: ${finalHeight}`);
}