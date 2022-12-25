import { readFileSync } from 'fs';

const toDecimal = (snafu) => snafu.split('').reverse().reduce((agg, snafuDigit, index) => {
    const n = {
        '=': -2,
        '-': -1,
        '0': 0,
        '1': 1,
        '2': 2,
    }[snafuDigit];
    return agg + n * Math.pow(5, index);
}, 0);

const toSnafu = (decimal) => {
    let chars = [];
    let total = 0;
    for (let i = 0; total < decimal; i++) {
        const pow = Math.pow(5, i);
        const shifted = Math.floor((decimal - total) / pow);
        const n = ((shifted + 2) % 5) - 2;
        const snafuDigit = {
            '-2': '=',
            '-1': '-',
            '0': '0',
            '1': '1',
            '2': '2',
        }[n];
        chars.unshift(snafuDigit);

        total += pow * n;
    }
    return chars.join('');
};

export default function day25() {
    const input = readFileSync('./day25/input.txt', { encoding: 'utf8' });
    const snafuNumbers = input.split('\n');

    const decimalNumbers = snafuNumbers.map(toDecimal);
    const sum = decimalNumbers.reduce((sum, n) => sum + n);
    const snafuSum = toSnafu(sum);

    console.log(`Answer: ${snafuSum}`);
}