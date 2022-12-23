import { readFileSync } from 'fs';

function mod(value, modulo) {
    const rem = value %= modulo;
    return rem < 0 ? rem + modulo : rem;
}

const add = (a, b) => a.map((n, i) => n + b[i]);

// function getNextPosition(map, position, direction) {
//     let [x, y] = position;
//     do {
//         if (direction[0] !== 0) {
//             x = mod(x + direction[0], map[y].length);
//         }
//         if (direction[1] !== 0) {
//             y = mod(y + direction[1], map.length)
//         }
//     } while (!map[y][x] || map[y][x] === ' ')

//     return [x, y];
// }

function getNextPosition(map, size, position, direction) {
    const nextPosition = add(position, direction);

    return [x, y];
}

const cubeMap = {
    [[1, 0]]: {
        right: [2, 0, 0],
        bottom: [1, 1, 0],
        left: [0, 2, 2],
        top: [0, 3, 1],
    },
    [[2, 0]]: {
        right: [1, 2, 2],
        bottom: [1, 1, 1],
        left: [1, 0, 0],
        top: [0, 3, 2],
    },
    [[1, 1]]: {
        right: [2, 0, 3],
        bottom: [1, 2, 0],
        left: [0, 2, 3],
        top: [1, 0, 0],
    },
    [[0, 2]]: {
        right: [1, 2, 0],
        bottom: [0, 3, 0],
        left: [1, 0, 2],
        top: [1, 1, 1],
    },
    [[1, 2]]: {
        right: [2, 0, 2],
        bottom: [0, 3, 1],
        left: [0, 2, 0],
        top: [1, 1, 0],
    },
    [[0, 3]]: {
        right: [1, 2, 3],
        bottom: [2, 0, 2],
        left: [1, 0, 3],
        top: [0, 2, 0],
    },
};

// const cubeMap = {
//     [[2, 0]]: {
//         right: [3, 2, 2],
//         bottom: [2, 1, 0],
//         left: [1, 1, 3],
//         top: [2, 2, 2],
//     },
//     [[0, 1]]: {
//         right: [1, 1, 0],
//         bottom: [2, 2, 2],
//         left: [3, 2, 1],
//         top: [2, 0, 2],
//     },
//     [[1, 1]]: {
//         right: [2, 1, 0],
//         bottom: [2, 2, 3],
//         left: [0, 1, 0],
//         top: [2, 0, 1],
//     },
//     [[2, 1]]: {
//         right: [3, 2, 1],
//         bottom: [2, 2, 0],
//         left: [1, 1, 0],
//         top: [2, 0, 0],
//     },
//     [[2, 2]]: {
//         right: [3, 2, 0],
//         bottom: [0, 1, 2],
//         left: [1, 1, 1],
//         top: [2, 1, 0],
//     },
//     [[3, 2]]: {
//         right: [2, 0, 2],
//         bottom: [0, 1, 3],
//         left: [2, 2, 0],
//         top: [2, 1, 3],
//     },
// }

function rotate(direction, rotation, times = 1) {
    for (let i = 0; i < times; i++) {
        const [x, y] = direction;
        if (rotation === 'L') {
            direction = [y, -x];
        }
        if (rotation === 'R') {
            direction = [-y, x];
        }
    }
    return direction;
}

function toDir([x, y]) {
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

function rotatePlane(plane, rotation = 1) {
    rotation = mode(rotation, 4);
    if (rotation === 0) {
        return plane;
    }
    const sides = ['right', 'bottom', 'left', 'top'];
    const newPlane = { ...plane };
    for (let i = 0; i < sides; i++) {
        newPlane[sides[i]] = plane[sides[mod(i + 3, 4)]];
    }
    return rotatePlane(newPlane, rotation - 1);
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
    const initialPosition = [xOffset, 0, 0];

    const planes = [];
    const open = [[0, 0, 0]];
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
                map[(ny) * size]?.[(nx + xOffset) % maxX * size] &&
                map[(ny) * size][(nx + xOffset) % maxX * size] !== ' '
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
        console.log(planes);
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
                        mod(-1 * plane[a][2] + -1 * plane[b][2] + 1, 4)
                    ];
                }
                const bSide = rotateSide(a, plane[b][2]);
                if (!bPlane[bSide]) {
                    bPlane[bSide] = [
                        plane[a][0],
                        plane[a][1],
                        mod(1 * plane[a][2] + 1 * plane[b][2] + 3, 4)
                    ];
                }
            });
        });
    }

    return planes;
}

function project(map) {
    const get = (position) => {
        const x = Math.floor(position[0] / size);
        const y = Math.floor(position[1] / size);
        const z = Math.floor(position[1] / size);
        return projections.find(([px, py]) => px === x && py === y);
    };

    const tileCount = map.flat().filter((cell) => cell !== ' ').length;
    const size = Math.sqrt(tileCount / 6);

    const startX = map[0].findIndex((cell) => cell !== ' ') / size;
    const initialPosition = [startX, 0, 0];

    let index = 0;
    const open = [
        {
            index,
            position: initialPosition,
            rotation: [1, 0, 0]
        }
    ];
    const projections = [];
    while (open.length > 0) {
        const proj = projection.pop();
        const [x, y, z] = proj.rotatation;
        projections.push(proj);
        const neighbors = [
            [[1, 0], [0, 0, x]],
            [[0, 1], [0, -x, 0]],
            [[-1, 0], []],
            [0, -1],
        ].filter(([dx, dy]) =>
            map[y + dy][x + dx] &&
            map[y + dy][x + dx] !== ' '
        ).map(([x, y]) => [0, 0, x]);

        neighbors.forEach(([x, y]) => {
            const n = [x, y, 1]
            rotations
            // add(neighbor, position);
        });
    }
    // start at start, walk to neighbors, add a rotation for each side;

}

export default function day22() {
    const input = readFileSync('./day22/input.txt', { encoding: 'utf8' });

    const [mapInput, pathInput] = input.replace(/\r/g, '').split('\n\n');
    const map = mapInput.split('\n').map((line) => line.split(''));

    const path = pathInput.match(/\d+\w?/g).map((step) => {
        const [count, rotation] = step.match(/(\d+)(\w)?/).slice(1);
        return { count: Number(count), rotation };
    });

    const test = toCube(map);
    console.log(JSON.stringify(test, null, 4));
    return;




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
    console.log(planes);

    function nextCubePosition(planes, size, position, direction) {
        const [x, y, z] = position;
        const cube = [Math.floor(x / size), Math.floor(y / size)];

        const wrappedX = mod(x, size);
        const wrappedY = mod(y, size);
        const newX = wrappedX + direction[0];
        const newY = wrappedY + direction[1];

        if (newX < 0 || newY < 0 || newX >= size || newY >= size) {
            console.log("jump");
            const map = cubeMap[cube];

            const [nextCubeX, nextCubeY, r] = map[toDir(direction)];

            let p = [wrappedX + direction[0], wrappedY + direction[1]];
            console.log("P", p);
            p = [p[0] - (size - 1) / 2, p[1] - (size - 1) / 2];
            direction = rotate(direction, 'R', r);
            p = rotate(p, 'R', r);
            p = [p[0] + (size - 1) / 2, p[1] + (size - 1) / 2];

            p = [mod(p[0], size), mod(p[1], size)];
            p = [p[0] + nextCubeX * size, p[1] + nextCubeY * size];

            return [p, direction];
        }
        return [[cube[0] * size + newX, cube[1] * size + newY], direction];
    }

    const startX = map[0].findIndex((cell) => cell !== ' ');
    const initialPosition = [startX, 0, 0];
    const initialDirection = [1, 0, 0];

    const next = nextCubePosition(planes, size, initialPosition, [-1, 0, 0]);
    console.log("Next", size, next);
    // return;


    // const [finalPosition, finalDirection] = path.reduce(([position, direction], step) => {
    //     console.log(position, direction);
    //     for (let i = 0; i < step.count; i++) {
    //         const nextPosition = getNextPosition(map, position, direction);
    //         if (map[nextPosition[1]]?.[nextPosition[0]] !== '#') {
    //             position = nextPosition;
    //         }
    //     }
    //     return [position, step.rotation ? rotate(direction, step.rotation) : direction]
    // }, [initialPosition, initialDirection]);


    const [finalPosition, finalDirection] = path.reduce(([position, direction], step) => {
        for (let i = 0; i < step.count; i++) {
            const [nextPosition, nextDirection] = getNextPosition(planes, size, position, direction);
            if (map[nextPosition[1]]?.[nextPosition[0]] !== '#') {
                position = nextPosition;
                direction = nextDirection;
            }
        }
        return [position, step.rotation ? rotate(direction, step.rotation) : direction]
    }, [initialPosition, initialDirection]);

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
    const facingScore = getFacingScore(finalDirection);

    console.log("F", finalPosition, finalDirection);

    const ans = 1000 * (finalPosition[1] + 1) + 4 * (finalPosition[0] + 1) + facingScore;
    console.log(ans);


    // console.log(rotate([1, 0], 'R'));
    // console.log(rotate([1, 0], 'L'));
    // console.log(rotate([0, 1], 'R'));

    // console.log(getNextPosition(map, [0, 0], [1, 0]));
}