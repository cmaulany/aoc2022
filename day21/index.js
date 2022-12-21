import { readFileSync } from 'fs';

function evaluate(monkeys, name) {
    const monkey = monkeys.find((monkey) => monkey.name === name);
    const { value, lhs, rhs, operation } = monkey;

    if (!operation) {
        return value ?? null;
    }

    const lhsValue = evaluate(monkeys, lhs);
    const rhsValue = evaluate(monkeys, rhs);

    if (lhsValue === null || rhsValue === null) {
        return null;
    }

    const op = {
        '=': (a, b) => a === b,
        '+': (a, b) => a + b,
        '*': (a, b) => a * b,
        '-': (a, b) => a - b,
        '/': (a, b) => a / b,
    }[operation];

    return op(lhsValue, rhsValue);
}

function solve(monkeys, name) {
    const value = evaluate(monkeys, name);
    if (value !== null) {
        return value;
    }

    const parent = monkeys.find((monkey) => monkey.lhs === name || monkey.rhs === name);
    if (!parent) {
        return null;
    }

    const { lhs, rhs, operation } = parent;
    const result = solve(monkeys, parent.name);
    const known = solve(monkeys, lhs === name ? rhs : lhs);

    const op = {
        '=': (_, known) => known,
        '+': (result, known) => result - known,
        '*': (result, known) => result / known,
        '-': (result, known) => lhs === name ?
            result + known :
            known - result,
        '/': (result, known) => result * known,
    }[operation]

    return op(result, known);
}

export default function day21() {
    const input = readFileSync('./day21/input.txt', { encoding: 'utf8' });
    const monkeys = input.split('\n').map((line) => {
        const [name, lhs, operation, rhs] = line.split(/:? /);
        if (!operation) {
            return {
                name,
                value: Number(lhs),
            };
        }
        return {
            name,
            lhs: lhs.match(/\d+/) ? Number(lhs) : lhs,
            operation,
            rhs: rhs.match(/\d+/) ? Number(rhs) : rhs,
        }
    });

    const evaluatedRoot = evaluate(monkeys, 'root');
    console.log(`Answer part 1: ${evaluatedRoot}`);

    const fixedMonkeys = monkeys.map((monkey) => {
        if (monkey.name === 'root') {
            return { ...monkey, operation: '=' };
        }
        if (monkey.name === 'humn') {
            return { ...monkey, value: undefined };
        }
        return monkey;
    });

    const solvedHumn = solve(fixedMonkeys, 'humn');
    console.log(`Answer part 2: ${solvedHumn}`);
}