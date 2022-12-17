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
            grid,
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

function tickUntill(state, condition) {
    while (!condition(state)) {
        state = tick(state);
    }
    return state;
}

const toList = (grid) => Object.entries(grid).reduce((list, [key, value]) => {
    const [x, y] = key.split(/,-?/);
    list[y] ??= [];
    list[y][x] = value
    return list;
}, []);

function render(grid) {
    const list = toList(grid);

    const rows = [];
    for (let y = list.length - 1; y > 0; y--) {
        const row = [];
        for (let x = 0; x < 7; x++) {
            row[x] = list[y][x] ?? '.';
        }
        rows[y] = row;
    }
    return rows.map((row) => row.join('')).join('\n');
}

export default function day17() {
    const input = readFileSync('./day17/input.txt', { encoding: 'utf8' });

    const jets = input.split('');
    const blocks = blocksInput.split('\n\n').map((blockInput) => blockInput.split('\n').map((line) => line.split('')));

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

    const firstTest = tickUntill(state, (state) => state.rockCount === 2022);
    console.log(`Answer part 1: ${-firstTest.minY}`);

    const end = tickUntill(firstTest, (state) => {
        return state.rockCount === 10000;
    });

    const out = render(end.grid);
    const repeat = out.replace(/\n/g, '').match(/(.+?)\1+$/);

    const patternHeight = repeat[1].length / 7;
    const repeatStart = repeat.index / 7;

    const nonRepeatingEnd = tickUntill({ ...state, grid: {} }, (state) => state.minY === -repeatStart);
    const firstRepeat = tickUntill(nonRepeatingEnd, (state) => state.minY === -repeatStart - patternHeight)
    const patternRockCount = firstRepeat.rockCount - nonRepeatingEnd.rockCount;

    const desired = 1000000000000
    const repeatCount = Math.floor((desired - nonRepeatingEnd.rockCount) / patternRockCount);

    const rem = (desired - nonRepeatingEnd.rockCount) % patternRockCount;
    const final = tickUntill(firstRepeat, (state) => state.rockCount === firstRepeat.rockCount + rem);
    const extra = -final.minY + firstRepeat.minY;

    const height = -nonRepeatingEnd.minY + repeatCount * patternHeight + extra;

    console.log(`Answer part 2: ${height}`);
}