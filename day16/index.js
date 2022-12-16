import { readFileSync } from 'fs';

function maximizeFlowRate(state) {
    const { time } = state;

    if (time === 0) {
        return state.score;
    }

    const valve = state.valves[state.location];

    const nextStates = valve.connections
        .filter((connection) => state.previousState?.location !== connection)
        .map((connection) => ({
            ...state,
            time: time - 1,
            location: connection,
            previousState: state,
        }));

    if (!valve.isOpen && valve.flowRate > 0) {
        nextStates.push({
            ...state,
            time: time - 1,
            score: state.score + valve.flowRate * (state.time - 1),
            valves: {
                ...state.valves,
                [state.location]: {
                    ...valve,
                    isOpen: true
                },
            },
            previousState: state,
        });
    }

    return Math.max(...nextStates.map(maximizeFlowRate));
}

export default function day16() {
    const input = readFileSync('./day16/input.txt', { encoding: 'utf8' });

    const valves = input.split('\n').reduce((valves, line) => {
        const [name, flowRate, connections] = line.match(/Valve (\w\w) has flow rate=(\d+); tunnels? leads? to valves? (.+)/).slice(1);
        valves[name] = {
            name,
            flowRate: Number(flowRate),
            connections: connections.split(', '),
            isOpen: false,
        };
        return valves;
    }, {});

    const initialState = {
        valves,
        location: 'AA',
        time: 30,
        score: 0,
    };

    const res = maximizeFlowRate(initialState);

    console.log(res);
}