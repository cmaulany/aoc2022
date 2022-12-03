import { readFileSync } from 'fs';

function findMisplacedItem(rucksack) {
    const [compartmentA, compartmentB] = rucksack;
    return compartmentA.find((c) => compartmentB.includes(c));
}

function getPriority(item) {
    if (item.toLowerCase() === item) {
        return item.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
    } else {
        return item.charCodeAt(0) - 'A'.charCodeAt(0) + 27;
    }
}

function findBadge(group) {
    const counts = {};
    group.forEach((rucksack) => {
        const itemTypes = new Set(rucksack.reduce((agg, compartment) => agg.concat(compartment)));
        itemTypes.forEach((item) => {
            counts[item] ??= 0;
            counts[item]++;
        });
    });
    const badge = Object.entries(counts).find(([_, count]) => count === 3)[0];
    return badge;
}

function getPrioritySum(items) {
    return items.map(getPriority).reduce((sum, n) => sum + n);
}

export default function day3() {
    const input = readFileSync('./day3/input.txt', { encoding: 'utf8' });

    const rucksacks = input.split('\n').map((line) => line.split('')).map((chars) => {
        const middle = chars.length / 2;
        return [
            chars.slice(0, middle),
            chars.slice(middle)
        ];
    });

    const groups = [];
    for (let i = 0; i < rucksacks.length; i += 3) {
        groups.push(rucksacks.slice(i, i + 3));
    }

    const misplacedItems = rucksacks.map(findMisplacedItem);
    const misplacedItemsPrioritySum = getPrioritySum(misplacedItems)

    const badges = groups.map(findBadge);
    const badgesPrioritySum = getPrioritySum(badges);

    console.log(`Answer part 1: ${misplacedItemsPrioritySum}`);
    console.log(`Answer part 2: ${badgesPrioritySum}`);
}