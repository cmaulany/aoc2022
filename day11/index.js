import { readFileSync } from 'fs';

function doTurn(state) {
    const { turn, round, monkeys } = state;
    const monkey = monkeys[turn % monkeys.length];

    const { items } = monkey;
    const nextState = items.reduce(throwItem, state);
    const nextTurn = turn + 1;

    return {
        ...nextState,
        turn: nextTurn,
        round: nextTurn % monkeys.length === 0 ? round + 1 : round,
    }
}

function throwItem(state) {
    const { turn, round, monkeys } = state;
    const id1 = turn % monkeys.length;
    const monkey = monkeys[id1];
    const { items, operation, value, test, ifTrue, ifFalse } = monkey;
    const [item, ...rest] = items;

    const v = value === 'old' ? item : value;
    const n = {
        '+': item + v,
        '*': item * v
    }[operation];
    const newItem = Math.floor(n / 3);

    const recipient = newItem % test === 0 ? ifTrue : ifFalse;
    return {
        ...state,
        monkeys: monkeys.map((monkey, id) => {
            if (id === id1) {
                return {
                    ...monkey,
                    inspectCount: monkey.inspectCount + 1,
                    items: rest
                };
            }
            if (id === recipient) {
                return {
                    ...monkey,
                    items: [...monkey.items, newItem]
                }
            }
            return monkey;
        })
    }
}

export default function day11() {
    const input = readFileSync('./day11/input.txt', { encoding: 'utf8' });

    const monkeys = input.split('\n\n').map((section) => {
        const lines = section.split('\n');
        const id = Number(lines[0].match(/Monkey (\d+):/)[1]);
        const items = lines[1].slice(18).split(', ').map(Number);
        const op = lines[2].slice(23).split(' ');
        const operation = op[0];
        const value = op[1] === 'old' ? op[1] : Number(op[1]);

        const test = Number(lines[3].slice(21));
        const ifTrue = Number(lines[4].slice(29));
        const ifFalse = Number(lines[5].slice(29));
        return {
            id,
            items,
            operation,
            value,
            test,
            ifTrue,
            ifFalse,
            inspectCount: 0,
        };
    });

    const state = {
        turn: 0,
        round: 0,
        monkeys
    };

    const s1 = Array.from({ length: state.monkeys.length * 20 }).reduce(doTurn, state);
    console.log(JSON.stringify(s1, null, 4));

    const sorted = s1.monkeys.sort((a, b) => a.inspectCount > b.inspectCount ? -1 : 1);
    const answer = sorted[0].inspectCount * sorted[1].inspectCount

    console.log(`Answer part 1: ${answer}`);
    console.log(`Answer part 2: ${2}`);
}