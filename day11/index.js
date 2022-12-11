import { readFileSync } from 'fs';

function roundReducer(state) {
    return Array.from({ length: state.monkeys.length }).reduce(turnReducer, state);
}

function turnReducer(state) {
    const { turn, round, monkeys } = state;
    const monkey = monkeys[turn % monkeys.length];
    const { items } = monkey;

    const nextState = items.reduce(throwItemReducer, state);
    const nextTurn = turn + 1;

    return {
        ...nextState,
        turn: nextTurn,
        round: nextTurn % monkeys.length === 0 ? round + 1 : round,
    }
}

function throwItemReducer(state) {
    const { turn, monkeys, sharedModulo, inspectLowersWorry } = state;
    const throwerId = turn % monkeys.length;
    const monkey = monkeys[throwerId];
    const { items, operation, value, modulo, ifTrue, ifFalse } = monkey;
    const [item, ...restItems] = items;

    const rhs = value === 'old' ? item : value;
    const itemAfterInspect = {
        '+': item + rhs,
        '*': item * rhs,
    }[operation];
    const itemAfterBored = inspectLowersWorry ? Math.floor(itemAfterInspect / 3) : itemAfterInspect;
    const nextItem = itemAfterBored % sharedModulo;

    const recipientId = nextItem % modulo === 0 ? ifTrue : ifFalse;

    const nextMonkeys = monkeys.map((monkey, id) => {
        if (id === throwerId) {
            return {
                ...monkey,
                inspectCount: monkey.inspectCount + 1,
                items: restItems,
            };
        }
        if (id === recipientId) {
            return {
                ...monkey,
                items: [...monkey.items, nextItem],
            }
        }
        return monkey;
    });

    return {
        ...state,
        monkeys: nextMonkeys,
    }
}

export default function day11() {
    const input = readFileSync('./day11/input.txt', { encoding: 'utf8' });

    const monkeys = input.split('\n\n').map((section) => {
        const lines = section.split('\n');
        const id = Number(lines[0][7]);
        const items = lines[1].slice(18).split(', ').map(Number);
        const [operation, value] = lines[2].slice(23).split(' ');
        const modulo = Number(lines[3].slice(21));
        const ifTrue = Number(lines[4].slice(29));
        const ifFalse = Number(lines[5].slice(29));

        return {
            id,
            items,
            operation,
            value: value === 'old' ? value : Number(value),
            modulo,
            ifTrue,
            ifFalse,
            inspectCount: 0,
        };
    });

    const sharedModulo = monkeys.reduce((acc, monkey) => acc * monkey.modulo, 1);

    const calculateAnswerAfterRounds = (state, rounds) => {
        const finalState = Array.from({ length: rounds }).reduce(roundReducer, state);
        const sorted = finalState.monkeys.sort((a, b) => a.inspectCount > b.inspectCount ? -1 : 1);
        return sorted[0].inspectCount * sorted[1].inspectCount;
    };

    const initialState = {
        turn: 0,
        round: 0,
        monkeys,
        sharedModulo,
    };

    const answerPart1 = calculateAnswerAfterRounds({ ...initialState, inspectLowersWorry: true }, 20);
    const answerPart2 = calculateAnswerAfterRounds({ ...initialState, inspectLowersWorry: false }, 10000);

    console.log(`Answer part 1: ${answerPart1}`);
    console.log(`Answer part 2: ${answerPart2}`);
}