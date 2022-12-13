import { readFileSync } from 'fs';

function compare(a, b) {
    if (!Array.isArray(a) && !Array.isArray(b)) {
        return a < b ? 1 : a > b ? -1 : 0;
    }

    if (!Array.isArray(a)) {
        return compare([a], b);
    }

    if (!Array.isArray(b)) {
        return compare(a, [b]);
    }

    for (let i = 0; i < a.length && i < b.length; i++) {
        const a_ = a[i];
        const b_ = b[i];
        const res = compare(a_, b_);
        if (res !== 0) {
            return res;
        }
    }
    return a.length < b.length ? 1 : a.length > b.length ? -1 : 0;
}

export default function day13() {
    const input = readFileSync('./day13/input.txt', { encoding: 'utf8' });

    const pairs = input.split('\n\n').map((group) => group.split('\n').map((line) => JSON.parse(line)));
    const res = pairs.map((pair) => compare(...pair));

    const indexes = res.map((r, i) => ({ r, i: i + 1 })).filter(({r}) => r === 1).map(({i}) => i);
    const sum = indexes.reduce((sum, i) => sum + i);

    console.log(sum);

    const concatted = [...pairs.flat(), [[2]], [[6]]].sort(compare).reverse();
    console.log(concatted);
    const a = concatted.findIndex((el) => JSON.stringify(el) === JSON.stringify([[2]])) + 1;
    const b = concatted.findIndex((el) => JSON.stringify(el) === JSON.stringify([[6]])) + 1;
    console.log(a * b);
}