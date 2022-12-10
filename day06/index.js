import { readFileSync } from 'fs';

function isMarker(state, size) {
    const { data, index } = state;
    const uniqueCharacters = new Set(data.slice(index, index + size));
    return uniqueCharacters.size === size;
}

const incrementIndex = (state) => ({
    ...state,
    index: state.index + 1
});

function findMarker(data, size) {
    let state = { data, index: 0 };
    while (!isMarker(state, size)) {
        state = incrementIndex(state);
    }
    return state.index + size;
}

export default function day6() {
    const data = readFileSync('./day06/input.txt', { encoding: 'utf8' });

    const startOfPacketMarker = findMarker(data, 4);
    const startOfMessageMarker = findMarker(data, 14);

    console.log(`Answer part 1: ${startOfPacketMarker}`);
    console.log(`Answer part 2: ${startOfMessageMarker}`);
}