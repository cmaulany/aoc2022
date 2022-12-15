import { readFileSync } from 'fs';

function mergeRanges(ranges) {
    if (ranges.length === 1) {
        return ranges;
    }

    const merged = ranges.sort((a, b) => a.start - b.start);
    for (let i = 0; i + 1 < merged.length; i++) {
        const current = merged[i];
        const next = merged[i + 1];
        if (next.start >= current.start && next.start <= current.end) {
            merged.splice(i, 2, {
                start: current.start,
                end: Math.max(next.end, current.end)
            });
            i--;
        }
    }
    return merged;
}

const clampRanges = (ranges, min, max) => ranges
    .filter((range) => range.end >= min && range.start <= max)
    .map((range) => ({
        start: Math.max(min, range.start),
        end: Math.min(max, range.end),
    }));

const sumRanges = (ranges) => ranges
    .map((range) => range.end - range.start + 1)
    .reduce((sum, size) => sum + size);

const getRangesInRow = (reports, rowIndex) => {
    const ranges = reports
        .filter(({ sensor }) => sensor.range >= Math.abs(rowIndex - sensor.y))
        .map(({ sensor }) => {
            const d = sensor.range - Math.abs(rowIndex - sensor.y);
            return {
                start: sensor.x - d,
                end: sensor.x + d
            };
        });
    return mergeRanges(ranges);
};

function getOnlyEmptyPosition(reports, size) {
    for (let y = 0; y <= size; y++) {
        const ranges = getRangesInRow(reports, y);
        const clamped = clampRanges(ranges, 0, size);
        if (sumRanges(clamped) <= size) {
            const x = clamped[0].end + 1;
            return x * size + y;
        }
    }
}

export default function day15() {
    const input = readFileSync('./day15/input.txt', { encoding: 'utf8' });

    const reports = input.split('\n').map((line) => {
        const [
            sensorX,
            sensorY,
            beaconX,
            beaconY,
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

    const rowIndex = 2000000;
    const ranges = getRangesInRow(reports, rowIndex);
    const occupiedXs = new Set(
        reports
            .flatMap(({ beacon, sensor }) => [beacon, sensor])
            .filter((item) => item.y === rowIndex)
            .map((item) => item.x)
    );
    const invalidPositionCount = sumRanges(ranges) - occupiedXs.size;
    console.log(`Answer part 1: ${invalidPositionCount}`);

    const emptyPosition = getOnlyEmptyPosition(reports, 4000000);
    console.log(`Answer part 2: ${emptyPosition}`);
}