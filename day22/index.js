import { readFileSync } from 'fs';

function mod(value, modulo) {
    const rem = value %= modulo;
    return rem < 0 ? rem + modulo : rem;
}

function getNextPosition(map, position, direction) {
    let [x, y] = position;
    do {
        if (direction[0] !== 0) {
            x = mod(x + direction[0], map[y].length);
        }
        if (direction[1] !== 0) {
            y = mod(y + direction[1], map.length)
        }
    } while (!map[y][x] || map[y][x] === ' ')

    return [x, y];
}

function getCubeNextPosition(map, size, position, direction) {

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

export default function day22() {
    const input = readFileSync('./day22/input.txt', { encoding: 'utf8' });

    const [mapInput, pathInput] = input.replace(/\r/g, '').split('\n\n');
    const map = mapInput.split('\n').map((line) => line.split(''));

    const path = pathInput.match(/\d+\w?/g).map((step) => {
        const [count, rotation] = step.match(/(\d+)(\w)?/).slice(1);
        return { count: Number(count), rotation };
    });

    const tileCount = map.flat().filter((cell) => cell !== ' ').length;
    const size = Math.sqrt(tileCount / 6);

    const planes = [];
    const width = Math.max(...map.map((row) => row.length));
    for (let y = 0; y < map.length; y += size) {
        for (let x = 0; x < width; x += size) {
            const v = map[y]?.[x];
            if (v && v !== ' ') {
                planes.push([x, y]);
            }
        }
    }

    function nextCubePosition(planes, size, position, direction) {
        const [x, y] = position;
        const wrappedX = x % size;
        const wrappedY = y % size;
        const newX = wrappedX + direction[0];
        const newY = wrappedY + direction[1];
        const cubeX = Math.floor(x / size) * size;
        const cubeY = Math.floor(y / size) * size;

        if (newX < 0 || newY < 0 || newX >= size || newY >= size) {
            const offset = direction;
            const deltas = [
                [1, 0, 0],
                [1, 1, 1],
                [1, 2, 2],
                [1, 3, 3],
                [-1, -2, 2],
            ].map(([x, y, r]) => [
                x * offset[0] + y * offset[1],
                y * offset[0] + x * offset[1],
                r
            ])

            const neighbors = deltas.map(([x, y, r]) => [mod(cubeX + x * size, size * 4), mod(cubeY + y * size, size * 4), r]);
            const [mx, my, r] = neighbors.find(([x, y]) => planes.some(([x_, y_]) => x_ === x && y_ === y));
            console.log('Moving from', position, 'in cube', [cubeX, cubeY], 'to', [mx, my, r], );

            let p = [mod(newX, size) - size / 2 + 1, mod(newY, size) - size / 2 + 1];
            console.log("PP", p);
            for (let i = 0; i < r; i++) {
                direction = rotate(direction, 'R');
                p = rotate(p, 'R');
            }
            p = [p[0] + mx + size / 2 - 1, p[1] + my + size / 2 - 1];
            console.log("New state", p, direction);
            return [p, direction];
        }
        return [[cubeX + newX, cubeY + newY], direction];
    }

    // const next = nextCubePosition(planes, 4, [8, 0], [-1, 0]);
    // console.log(next);
    // console.log("Planes", planes);

    const startX = map[0].findIndex((cell) => cell !== ' ');
    const initialPosition = [startX, 0];
    const initialDirection = [1, 0];

    console.log('!', map[11][15]);

    const [finalPosition, finalDirection] = path.reduce(([position, direction], step) => {
        // console.log('tick', position, direction);
        for (let i = 0; i < step.count; i++) {
            // console.log(direction);
            const [nextPosition, nextDirection] = nextCubePosition(planes, size, position, direction);
            if (map[nextPosition[1]]?.[nextPosition[0]] !== '#') {
                position = nextPosition;
                direction = nextDirection;
            }
            // position = map[nextPosition[1]][nextPosition[0]] === '#' ? position : nextPosition;
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

    console.log("F", finalPosition, finalDirection);

    const ans = 1000 * (finalPosition[1] + 1) + 4 * (finalPosition[0] + 1) + facingScore;
    console.log(ans);




    // console.log(getNextPosition(map, [0, 0], [1, 0]));
}