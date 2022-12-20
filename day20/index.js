import { readFileSync } from 'fs';

function decrypt(file, key = 1, cycles = 1) {
    const multiplied = file.map((number) => number * key);
    let indexed = multiplied.map((number, index) => [number, index]);

    let mixed = indexed;
    for (let cycle = 0; cycle < cycles; cycle++) {
        mixed = multiplied.reduce((mixed, number, i) => {
            const index = mixed.findIndex(([_, j]) => i === j);
            const [entry] = mixed.splice(index, 1);

            let nextPosition = index + number;
            nextPosition %= mixed.length;
            if (nextPosition < 0) {
                nextPosition += mixed.length;
            }
            mixed.splice(nextPosition, 0, entry);

            return mixed;
        }, mixed);

    }

    return mixed.map(([number]) => number);
}

function getCoordinates(file) {
    const zeroIndex = file.indexOf(0);
    const indexes = [1000, 2000, 3000].map(
        (offset) => (zeroIndex + offset) % file.length
    );
    return indexes.map((index) => file[index]);
}

export default function day20() {
    const input = readFileSync('./day20/input.txt', { encoding: 'utf8' });
    const file = input.split('\n').map(Number);

    const mixedOnce = decrypt(file);
    const mixedCoordinates = getCoordinates(mixedOnce);
    const mixedSum = mixedCoordinates.reduce((a, b) => a + b);
    console.log(`Answer part 1: ${mixedSum}`);

    const decrypted = decrypt(file, 811589153, 10);
    const decryptedCoordinates = getCoordinates(decrypted);
    const decryptedSum = decryptedCoordinates.reduce((a, b) => a + b);
    console.log(`Answer part 1: ${decryptedSum}`);
}