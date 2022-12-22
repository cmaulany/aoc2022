import { readFileSync } from 'fs';

function getNextPosition(map, position, direction) {
    // const width = Math.max(...map.map((row) => row.length));
    let [x, y] = position;
    do {
        if (direction[0] !== 0) {
            x = (x + direction[0]) % map[y].length;
            if (x < 0) {
                x += map[y].length;
            }
        }
        if (direction[1] !== 0) {
            y = (y + direction[1]) % map.length;
            if (y < 0) {
                y += map.length;
            }
        }
    } while (!map[y][x] || map[y][x] === ' ')

    return [x, y];
}

function rotate(direction, rotation) {
    const [x, y] = direction;
    if (rotation === 'L') {
        return [y, -x];
    }
    if (rotation === 'R') {
        return [-y, x];
    }
}

// function getOuterMap(isBlocked, min, max) {
//     const isOuter = { [min]: isBlocked[min] === true };
//     const open = [min];
//     while (open.length > 0) {
//         const cube = open.shift();

//         const newNeighbors = getNeighbors(cube).filter((neighbor) =>
//             !isOuter.hasOwnProperty(neighbor) &&
//             !isBlocked[neighbor] &&
//             neighbor.every((value, i) =>
//                 value >= min[i] &&
//                 value <= max[i]
//             )
//         );

//         newNeighbors.forEach((neighbor) => isOuter[neighbor] = true);
//         open.push(...newNeighbors);
//     }
//     return isOuter;
// }

export default function day22() {
    const input = readFileSync('./day22/input.txt', { encoding: 'utf8' });

    const [mapInput, pathInput] = input.replace(/\r/g, '').split('\n\n');
    const map = mapInput.split('\n').map((line) => line.split(''));

    const path = pathInput.match(/\d+\w?/g).map((step) => {
        const [count, rotation] = step.match(/(\d+)(\w)?/).slice(1);
        return { count: Number(count), rotation };
    });

    const pos = [8, 12];
    const np = getNextPosition(map, [12, 8], [0, -1]);
    console.log(np, map[np[1]][np[0]]);

    // return;

    const startX = map[0].findIndex((cell) => cell !== ' ');
    const initialPosition = [startX, 0];
    const initialDirection = [1, 0];

    const [finalPosition, finalDirection] = path.reduce(([position, direction], step) => {
        console.log(position, direction, step);
        for (let i = 0; i < step.count; i++) {
            const nextPosition = getNextPosition(map, position, direction);
            position = map[nextPosition[1]][nextPosition[0]] === '#' ? position : nextPosition;
        }
        return [position, step.rotation ? rotate(direction, step.rotation) : direction]
    }, [initialPosition, initialDirection]);

    const facingScore = {
        [[1, 0]]: 0,
        [[1, -0]]: 0,
        [[0, 1]]: 1,
        [[-0, 1]]: 1,
        [[-1, 0]]: 2,
        [[-1, -0]]: 2,
        [[0, -1]]: 3,
        [[-0, -1]]: 3,
    }[finalDirection];

    console.log(finalPosition, finalDirection);

    const ans = 1000 * (finalPosition[1] + 1) + 4 * (finalPosition[0] + 1) + facingScore;
    console.log(ans);


    // console.log(getNextPosition(map, [0, 0], [1, 0]));
}