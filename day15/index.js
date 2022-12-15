import { readFileSync } from 'fs';

const cap = 4000000;

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

    function mergeRanges(ranges) {
        if (ranges.length === 1) {
            return ranges;
        }

        const merged = ranges.sort((a, b) => a.start - b.start);
        for (let i = 1; i < merged.length; i++) {
            const current = merged[i];
            const previous = merged[i - 1];
            if (current && current.start >= previous.start && current.start <= previous.end) {
                merged.splice(
                    i - 1,
                    2,
                    {
                        start: previous.start,
                        end: Math.max(current.end, previous.end)
                    }
                );
                i--;
            }
        }
        return merged;
    }

    function clampRanges(ranges, min, max) {
        const newRanges = ranges.slice();
        for (let i = 0; i < newRanges.length; i++) {
            const range = newRanges[i];
            if (range.end < min || range.start > max) {
                newRanges.splice(i, 1);
                i--;
            }
            else {
                newRanges[i] = {
                    start: Math.max(min, range.start),
                    end: Math.min(max, range.end),
                };
            }
        }
        return newRanges;
    }

    function count(ranges) {
        return ranges.reduce((sum, { start, end }) => sum + end + 1 - start, 0);
    }

    const countRow = (reports, rowIndex, clamp) => {
        const ranges = [];
        reports.forEach((report) => {
            const { sensor } = report;
            const dy = Math.abs(rowIndex - sensor.y);
            const overlap = sensor.range - dy;
            if (overlap >= 0) {
                ranges.push({
                    start: sensor.x - overlap,
                    end: sensor.x + overlap
                });
            }
        });

        const merged = mergeRanges(ranges);
        const clamped = clamp !== undefined ? clampRanges(merged, 0, clamp) : merged;

        // const junk = new Set([
        //     ...reports
        //         .map(({ beacon }) => beacon)
        //         .filter((beacon) => beacon.y === rowIndex)
        //         .map((beacon) => beacon.x),
        //     ...reports
        //         .map(({ sensor }) => sensor)
        //         .filter((sensor) => sensor.y === rowIndex)
        //         .map((sensor) => sensor.x)
        // ]);

        return clamped; // - junk.size;
    };

    // const map = reports.reduce(addReport, {});
    // console.log(countRow(reports, 9));

    // console.log(countRow(reports, 2000000));
    for (let y = 0; y <= cap; y++) {
        // if (y % 100000 === 0) {
        //     console.log(y);
        // }
        const clamped = countRow(reports, y, cap);
        if (count(clamped) <= cap) {
            console.log("Y", y, clamped);
        }
        // console.log(test);
    }
    const coord = [3120101, 2634249];
    // console.log('done');
    // console.log(mergeRanges([{ start: 10, end: 15 }, { start: 12, end: 20 }]));
    // console.log(mergeRanges([{ start: 10, end: 30 }, { start: 12, end: 20 }]));
    // console.log(mergeRanges([{ start: 10, end: 15 }, { start: 18, end: 20 }]));
    // const clamped = clampRanges(
    //     [
    //         { start: -10, end: 20 },
    //         { start: -5, end: -8 },
    //         { start: -10, end: 60 },
    //         { start: 30, end: 60 }
    //     ], 0, 40);
    // console.log(clamped);

    // console.log(reports);
}