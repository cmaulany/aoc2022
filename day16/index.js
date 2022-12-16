import { readFileSync } from 'fs';

function getDistanceMap(valves) {
    const map = {};
    Object.keys(valves).forEach((location) => map[location] = getDistances(valves, location));
    return map;
}

function getDistances(valves, location) {
    const score = { [location]: 0 };
    const open = [location];
    while (open.length > 0) {
        const location = open.shift()
        const valve = valves[location];

        const newConnections = valve.connections.filter((connection) => !score.hasOwnProperty(connection));

        newConnections.forEach((connection) => score[connection] = score[location] + 1)
        open.push(...newConnections);
    }
    return score;
}

function maximizeFlowRate(state) {
    const { time, valves, location, distanceMap, score } = state;

    const nextStates = Object.entries(valves)
        .filter(([name, valve]) =>
            !valve.isOpen &&
            valve.flowRate > 0 &&
            time - distanceMap[location][name] - 1 > 0
        )
        .map(([name, nextValve]) => {
            const distance = distanceMap[location][name];
            const nextTime = time - distance - 1;
            return {
                ...state,
                location: name,
                time: nextTime,
                score: score + nextValve.flowRate * nextTime,
                valves: {
                    ...valves,
                    [name]: {
                        ...nextValve,
                        isOpen: true
                    }
                }
            }
        });

    return Math.max(score, ...nextStates.map(maximizeFlowRate));
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
        distanceMap: getDistanceMap(valves),
    };

    // console.log(initialState);

    const res = maximizeFlowRate(initialState);
    console.log(res);
}