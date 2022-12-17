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
        blockIndex,
        blockPosition,
        minY,
        jetIndex,
        jets,
        action,
        width,
        grid,
        rockCount,
    } = state;

    if (!blockPosition) {
        // console.log("SPAWN");
        return {
            ...state,
            blockPosition: {
                x: 2,
                y: minY - 4 - blocks[blockIndex].length
            },
            action: 'fall',
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
            y: blockPosition.y + 1,
        };

    const isColliding = block.some((row, dy) =>
        row.some((symbol, dx) => {
            const x = nextBlockPosition.x + dx;
            const y = nextBlockPosition.y + dy;
            return y >= 0 || (symbol === '#' && grid[`${x},${y}`]);
        })
    );

    if (action === 'push') {
        return {
            ...state,
            blockPosition: isColliding ? blockPosition : nextBlockPosition,
            jetIndex: (jetIndex + 1) % jets.length,
            action: 'fall',
        };
    }

    if (action === 'fall' && isColliding) {
        const nextGrid = block.reduce((grid, row, dy) =>
            row.reduce((grid, symbol, dx) => {
                if (symbol === '#') {
                    const x = blockPosition.x + dx;
                    const y = blockPosition.y + dy;
                    grid[`${x},${y}`] = symbol;
                }
                return grid;
            }, grid),
            { ...grid },
        );
        const nextIndex = (blockIndex + 1) % blocks.length;
        const nextMinY = Math.min(minY, blockPosition.y);
        return {
            ...state,
            blockPosition: {
                x: 2,
                y: nextMinY - 4 - blocks[nextIndex].length
            },
            blockIndex: nextIndex,
            grid: nextGrid,
            minY: nextMinY,
            rockCount: rockCount + 1,
        }
    }

    return {
        ...state,
        blockPosition: nextBlockPosition,
        action: 'push',
    };
}

function tickN(state, n) {
    for (let i = 0; i < n; i++) {
        state = tick(state);
    }
    return state;
}

function tickTill(state, condition) {
    while (!condition(state)) {
        state = tick(state);
    }
    return state;
}

export default function day17() {
    const input = readFileSync('./day17/input.txt', { encoding: 'utf8' });

    const jets = input.split('');

    const blocks = blocksInput.split('\n\n').map((blockInput) => blockInput.split('\n').map((line) => line.split('')));
    console.log(blocks);
    console.log(input);

    const state = {
        width: 7,
        jets,
        jetIndex: 0,
        blocks,
        blockIndex: 0,
        grid: {},
        minY: 0,
        rockCount: 0,
    };
    const end = tickTill(state, (state) => state.rockCount === 2022);
    console.log(end);
    // console.log(tickN(state, 12));
}