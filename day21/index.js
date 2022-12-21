import { readFileSync } from 'fs';

function evaluate(monkeys, name) {
    const monkey = monkeys.find((monkey) => monkey.name === name);
    const { value, lhs, rhs, operation } = monkey;
    if (value !== undefined) {
        return value;
    }

    const op = {
        '+': (a, b) => a + b,
        '*': (a, b) => a * b,
        '-': (a, b) => a - b,
        '/': (a, b) => a / b,
    }[operation];

    return op(evaluate(monkeys, lhs), evaluate(monkeys, rhs));
}

function solve(monkeys, name, value) {
    const monkey = monkeys.find((monkey) => monkey.name === name);
    const { lhs, rhs, operation } = monkey;

    let lhsValue;
    try {
        lhsValue = evaluate(monkeys, lhs);
    } catch (e) { }

    let rhsValue;
    try {
        rhsValue = evaluate(monkeys, rhs);
    } catch (e) { }

    if (name === 'humn') {
        console.log(monkey, value);
        return;
    }

    if (lhsValue === undefined) {
        const op = {
            '=': (result, b) => b,
            '+': (result, b) => result - b,
            '*': (result, b) => Math.round(result / b),
            '-': (result, b) => result + b,
            '/': (result, b) => result * b,
        }[operation]
        return solve(monkeys, lhs, op(value, rhsValue));
    } else {
        const op = {
            '=': (result, b) => b,
            '+': (result, a) => result - a,
            '*': (result, a) => Math.round(result / a),
            '-': (result, a) => a - result,
            '/': (result, a) => result * a,
        }[operation]
        return solve(monkeys, rhs, op(value, lhsValue));
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

    // console.log(monkeys);
    // console.log(evaluate(monkeys, 'root'));

    monkeys.forEach((monkey) => {
        if (monkey.name === 'humn') {
            delete monkey.value;
        }
        if (monkey.name === 'root') {
            monkey.operation = '=';
        }
    });


    console.log(solve(monkeys, 'root'));

    const test = 3769668716709

    monkeys.forEach((monkey) => {
        if (monkey.name === 'humn') {
            monkey.value = test;
        }
        if (monkey.name === 'root') {
            monkey.operation = '-';
        }
    });

    console.log("T", evaluate(monkeys, 'root'));
}