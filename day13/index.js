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

    const pairsAreOrdered = pairs.map((pair) => compare(...pair));
    const indexesOfOrderedPairs = pairsAreOrdered
        .map((pairIsOrdered, index) => ({ pairIsOrdered, index: index + 1 }))
        .filter(({ pairIsOrdered }) => pairIsOrdered === 1)
        .map(({ index }) => index);
    const sum = indexesOfOrderedPairs.reduce((sum, index) => sum + index);
    console.log(`Answer part 1: ${sum}`);

    const tokens = [
        [[2]],
        [[6]]
    ];

    const orderedPackets = [...pairs.flat(), ...tokens].sort(compare).reverse();
    const indexes = tokens.map((token) =>
        orderedPackets.findIndex(
            (list) => JSON.stringify(list) == JSON.stringify(token)
        ) + 1
    );
    const product = indexes.reduce((product, index) => product * index);
    console.log(`Answer part 2: ${product}`);
}