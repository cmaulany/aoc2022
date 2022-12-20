import { readFileSync } from 'fs';

function mix(file) {
    const og = file.map((n, i) => [n * 811589153, i]);
    console.log("M", og);
    let indexed = og;
    for (let i = 0; i < 10; i++) {
        indexed = og.reduce((mixedFile, entry) => {
            const [number, i] = entry;
            const index = mixedFile.findIndex(([_, j]) => j === i);

            mixedFile.splice(index, 1);
            let nextPosition = index + number;
            nextPosition %= mixedFile.length;
            if (nextPosition < 0) {
                nextPosition += mixedFile.length;
            } else {
                nextPosition %= mixedFile.length;
            }
            mixedFile.splice(nextPosition, 0, entry);

            return mixedFile;
        }, indexed.slice());

    }
    return indexed.map(([n]) => n);
}

function findAns(file) {
    const zero = file.indexOf(0);
    const ns = [1000, 2000, 3000].map((n) => (zero + n) % file.length).map((n) => file[n]);
    const sum = ns.reduce((a, b) => a + b);
    console.log(ns, sum);
    return sum;
}

export default function day20() {
    const input = readFileSync('./day20/input.txt', { encoding: 'utf8' });
    const file = input.split('\n').map(Number);
    console.log(file);
    console.log('mixed', mix(file));
    console.log(findAns(mix(file)));
}