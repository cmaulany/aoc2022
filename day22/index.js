import { readFileSync } from 'fs';

function mod(value, modulo) {
    const rem = value %= modulo;
    return rem < 0 ? rem + modulo : rem;
}

function getNextFlatPosition(map, position, direction) {
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

function rotate(direction, times = 1) {
    for (let i = 0; i < mod(times, 4); i++) {
        const [x, y] = direction;
        direction = [-y, x];
    }
    return direction;
}

function toEdgeName([x, y]) {
    if (x === 1) {
        return 'right';
    }
    if (y === 1) {
        return 'bottom';
    }
    if (x === -1) {
        return 'left';
    }
    if (y === -1) {
        return 'top';
    }
}

function rotateSide(side, rotation = 1) {
    const sides = ['right', 'bottom', 'left', 'top'];
    const index = sides.indexOf(side);
    return sides[mod(index + rotation, 4)];
}

function toCube(map) {
    const tileCount = map.flat().filter((cell) => cell !== ' ').length;
    const size = Math.sqrt(tileCount / 6);

    const xOffset = map[0].findIndex((cell) => cell !== ' ') / size;
    const maxX = Math.max(...map.map((row) => row.length)) / size;

    const planes = [];
    const open = [[xOffset, 0, 0]];
    while (open.length > 0) {
        const position = open.pop();
        const [x, y, r] = position;

        const plane = Object.entries({
            right: [1, 0, 0],
            bottom: [0, 1, 0],
            left: [-1, 0, 0],
            top: [0, -1, 0],
        })
            .map(([direction, [dx, dy, dr]]) => [direction, [x + dx, y + dy, dr + r]])
            .filter(([_, [nx, ny]]) =>
                map[(ny) * size]?.[nx % maxX * size] &&
                map[(ny) * size][nx % maxX * size] !== ' '
            ).reduce(
                (neighbors, [key, [nx, ny, r]]) => ({
                    ...neighbors,
                    [key]: [nx, ny, r]
                }), {}
            );

        planes.push({
            ...plane,
            position: [x, y, r],
        });

        const openNeighbors = Object.values(plane).filter(([nx, ny]) =>
            planes.every((plane) =>
                plane.position[0] !== nx ||
                plane.position[1] !== ny
            )
        );

        open.push(...Object.values(openNeighbors));
    }

    while (planes.some((plane) =>
        !plane.right ||
        !plane.bottom ||
        !plane.left ||
        !plane.top
    )) {
        planes.forEach((plane) => {
            const pairs = [
                ["right", "bottom"],
                ["bottom", "left"],
                ["left", "top"],
                ["top", "right"],
            ];
            pairs.forEach(([a, b]) => {
                if (!plane[a] || !plane[b]) {
                    return;
                }
                const aPlane = planes.find((p) =>
                    p.position[0] === plane[a]?.[0] &&
                    p.position[1] === plane[a]?.[1]
                );
                const bPlane = planes.find((p) =>
                    p.position[0] === plane[b]?.[0] &&
                    p.position[1] === plane[b]?.[1]
                )
                const aSide = rotateSide(b, plane[a][2]);
                if (!aPlane[aSide]) {
                    aPlane[aSide] = [
                        plane[b][0],
                        plane[b][1],
                        mod(-plane[a][2] - plane[b][2] + 1, 4)
                    ];
                }
                const bSide = rotateSide(a, plane[b][2]);
                if (!bPlane[bSide]) {
                    bPlane[bSide] = [
                        plane[a][0],
                        plane[a][1],
                        mod(plane[a][2] + plane[b][2] - 1, 4)
                    ];
                }
            });
        });
    }

    return planes;
}

function getNextCubePosition(cubeMap, size, position, direction) {
    const [x, y] = position;
    const cube = [Math.floor(x / size), Math.floor(y / size)];

    const relativeX = mod(x, size) + direction[0];
    const relativeY = mod(y, size) + direction[1];

    if (relativeX >= 0 && relativeX < size && relativeY >= 0 && relativeY < size) {
        return [[x + direction[0], y + direction[1]], direction];
    }

    const plane = cubeMap.find((map) =>
        map.position[0] === cube[0] &&
        map.position[1] === cube[1]
    );

    const [nextCubeX, nextCubeY, r] = plane[toEdgeName(direction)];

    const rotationOffset = (size - 1) / 2;
    let rotated = [
        relativeX - rotationOffset,
        relativeY - rotationOffset,
    ];
    rotated = rotate(rotated, r);
    rotated = [
        mod(rotated[0] + rotationOffset, size),
        mod(rotated[1] + rotationOffset, size),
    ];

    const nextPosition = [rotated[0] + nextCubeX * size, rotated[1] + nextCubeY * size];
    return [nextPosition, rotate(direction, r)];
}

function getFacingScore([x, y]) {
    if (x === 1) {
        return 0;
    }
    if (y === 1) {
        return 1;
    }
    if (x === -1) {
        return 2;
    }
    if (y === -1) {
        return 3;
    }
};

const getScore = (position, direction) =>
    1000 * (position[1] + 1) +
    4 * (position[0] + 1) +
    getFacingScore(direction);

const input = readFileSync('./day22/input.txt', { encoding: 'utf8' });
export default function day22() {

    const [mapInput, pathInput] = input.replace(/\r/g, '').split('\n\n');
    const map = mapInput.split('\n').map((line) => line.split(''));

    const path = pathInput.match(/\d+\w?/g).map((step) => {
        const [count, rotation] = step.match(/(\d+)(\w)?/).slice(1);
        return { count: Number(count), rotation };
    });

    const cube = toCube(map);
    const tileCount = map.flat().filter((cell) => cell !== ' ').length;
    const size = Math.sqrt(tileCount / 6);

    const startX = map[0].findIndex((cell) => cell !== ' ');
    const initialPosition = [startX, 0, 0];
    const initialDirection = [1, 0, 0];

    const [flatFinalPosition, flatFinalDirection] = path.reduce(([position, direction], step) => {
        for (let i = 0; i < step.count; i++) {
            const nextPosition = getNextFlatPosition(map, position, direction);
            if (map[nextPosition[1]]?.[nextPosition[0]] !== '#') {
                position = nextPosition;
            }
        }
        const rotation = step.rotation === 'R' ? 1 : step.rotation === 'L' ? -1 : 0;
        return [
            position,
            rotate(direction, rotation),
        ]
    }, [initialPosition, initialDirection]);

    const answerPart1 = getScore(flatFinalPosition, flatFinalDirection);
    console.log(`Answer part 1: ${answerPart1}`);


    const [finalCubePosition, finalCubeDirection] = path.reduce(([position, direction], step) => {
        for (let i = 0; i < step.count; i++) {
            const [nextPosition, nextDirection] = getNextCubePosition(cube, size, position, direction);
            if (map[nextPosition[1]]?.[nextPosition[0]] !== '#') {
                position = nextPosition;
                direction = nextDirection;
            }
        }
        const rotation = step.rotation === 'R' ? 1 : step.rotation === 'L' ? -1 : 0;
        return [
            position,
            rotate(direction, rotation),
        ]
    }, [initialPosition, initialDirection]);
    const answerPart2 = getScore(finalCubePosition, finalCubeDirection)
    console.log(`Answer part 2: ${answerPart2}`);
}