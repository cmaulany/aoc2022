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
    const { lhs, rhs, operation } = parent;
    if (lhs === name) {
        const op = {
            '=': (_, b) => solve(monkeys, b),
            '+': (result, b) => solve(monkeys, result) - solve(monkeys, b),
            '*': (result, b) => solve(monkeys, result) / solve(monkeys, b),
            '-': (result, b) => solve(monkeys, result) + solve(monkeys, b),
            '/': (result, b) => solve(monkeys, result) * solve(monkeys, b),
        }[operation]
        return op(parent.name, rhs);
    } else {
        const op = {
            '=': (_, a) => solve(monkeys, a),
            '+': (result, a) => solve(monkeys, result) - solve(monkeys, a),
            '*': (result, a) => solve(monkeys, result) / solve(monkeys, a),
            '-': (result, a) => solve(monkeys, a) - solve(monkeys, result),
            '/': (result, a) => solve(monkeys, result) * solve(monkeys, a),
        }[operation]
        return op(parent.name, lhs);
    }
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

    monkeys.forEach((monkey) => {
        if (monkey.name === 'root') {
            monkey.operation = '=';
        }
        if (monkey.name === 'humn') {
            delete monkey.value;
        }
    });

    const solvedHumn = solve(monkeys, 'humn');
    console.log(`Answer part 2: ${solvedHumn}`);
}