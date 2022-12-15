import { readFileSync } from 'fs';

// const toKey = (position) => `${position.x},${position.y}`;

// function addReport(map, report) {
//     const { sensor, beacon } = report;
//     const dx = Math.abs(beacon.x - sensor.x);
//     const dy = Math.abs(beacon.y - sensor.y);

//     const distance = dx + dy;

//     map[toKey(sensor)] = 'S';
//     map[toKey(beacon)] = 'B';

//     for (let x = sensor.x - dx; x <= sensor.x + dx; x++) {
//         for (let y = sensor.y - dy; y <= sensor.y + dy; y++) {
//             if (Math.abs(x - sensor.x) + Math.abs(y - sensor.y) <= distance) {
//                 map[toKey({ x, y })] ??= '#';
//             }
//         }
//     }

//     return map;
// }

export default function day15() {
    const input = readFileSync('./day15/input.txt', { encoding: 'utf8' });

    const reports = input.split('\n').map((line) => {
        const [
            sensorX,
            sensorY,
            beaconX,
            beaconY
        ] = line.match(/Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/)
            .slice(1).map(Number);
        const range = Math.abs(sensorX - beaconX) + Math.abs(sensorY - beaconY);
        return {
            sensor: {
                x: sensorX,
                y: sensorY,
                range,
            },
            beacon: {
                x: beaconX,
                y: beaconY,
            },
        };


    });

    const countRow = (reports, rowIndex) => {
        const xs = new Set();
        reports.forEach((report) => {
            const { sensor } = report;
            const dy = Math.abs(rowIndex - sensor.y);
            const overlap = sensor.range - dy;
            if (overlap >= 0) {
                for (let x = -overlap; x <= overlap; x++) {
                    xs.add(sensor.x + x);
                }
            }
        });

        const otherInRow = new Set(
            [
                ...reports
                    .map(({ beacon }) => beacon)
                    .filter((beacon) => beacon.y === rowIndex)
                    .map((beacon) => beacon.x),
                ...reports
                    .map(({ sensor }) => sensor)
                    .filter((sensor) => sensor.y === rowIndex)
                    .map((sensor) => sensor.x)
            ]
        );

        // console.log(xs, beaconsInRow);

        return xs.size - otherInRow.size;
    };

    // const map = reports.reduce(addReport, {});
    // console.log(countRow(reports, 9));

    for (let i = 0 )

    // console.log(countRow(reports, 2000000));

    // console.log(reports);
}