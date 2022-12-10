import { readFileSync } from 'fs';

function reduceCommand(states, command) {
    const [state] = states;

    const { instruction, value } = command;

    switch (instruction) {
        case "noop":
            return [
                {
                    ...state,
                    cycle: state.cycle + 1
                },
                ...states
            ];
        case "addx":
            return [
                {
                    ...state,
                    cycle: state.cycle + 2,
                    x: state.x + value
                },
                {
                    ...state,
                    cycle: state.cycle + 1
                },
                ...states
            ];
    }
}

function render(states, width) {
    const pixels = states.reverse().map((state, i) => {
        const pixelPosition = i % width;
        const isLit = Math.abs(state.x - pixelPosition) <= 1;
        return isLit ? '#' : '.';
    });

    for (let i = 0; i < pixels.length; i += width) {
        console.log(pixels.slice(i, i + width).join(''));
    }
}

export default function day10() {
    const input = readFileSync('./day10/input.txt', { encoding: 'utf8' });

    const program = input.split('\n').map((line) => {
        const [instruction, value] = line.split(' ');
        return {
            instruction,
            value: Number(value) || 0
        };
    });

    const initialState = {
        cycle: 1,
        x: 1
    };

    const states = program.reduce(reduceCommand, [initialState]);

    const signalStrengths = [20, 60, 100, 140, 180, 220].map((cycle) => {
        const state = states.find((state) => state.cycle === cycle);
        return state.x * cycle;
    });

    const sum = signalStrengths.reduce((sum, signalStrength) => sum + signalStrength);
    console.log(`Answer part 1: ${sum}`);

    console.log(`Answer part 2:`);
    render(states, 40);
}