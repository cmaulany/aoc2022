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
        '+': (a, b) => a + b,
        '*': (a, b) => a * b,
        '-': (a, b) => a - b,
        '/': (a, b) => a / b,
    }[operation];

    return op(lhsValue, rhsValue);
}

function solve(monkeys, name, value) {
    if (name === 'humn') {
        return value;
    }

    const monkey = monkeys.find((monkey) => monkey.name === name);
    const { lhs, rhs, operation } = monkey;

    const lhsValue = evaluate(monkeys, lhs);
    const rhsValue = evaluate(monkeys, rhs);

    if (lhsValue === null) {
        const op = {
            '=': (_, b) => b,
            '+': (result, b) => result - b,
            '*': (result, b) => result / b,
            '-': (result, b) => result + b,
            '/': (result, b) => result * b,
        }[operation]
        return solve(monkeys, lhs, op(value, rhsValue));
    } else {
        const op = {
            '=': (_, a) => a,
            '+': (result, a) => result - a,
            '*': (result, a) => result / a,
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

    const solvedHumn = solve(monkeys, 'root');
    console.log(`Answer part 2: ${solvedHumn}`);
}