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
    const { time, valves, location, distanceMap, score, path } = state;

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
                path: [...path, name],
                valves: {
                    ...valves,
                    [name]: {
                        ...nextValve,
                        isOpen: true
                    }
                }
            }
        });


    return nextStates
        .map(maximizeFlowRate)
        .reduce((max, state) => state.score > max.score ? state : max, state);
}

const optimals = {};

function cached(state) {
    const key = Object.keys(state.valves).sort();

    if (optimals[key]) {
        return optimals[key];
    }

    const res = maximizeFlowRate(state);
    optimals[key] = res.score;

    return res.score;
}

function maximizeFlowRate2(state) {
    const { time, valves, location, distanceMap, score, path } = state;

    const nextStates = Object.entries(valves)
        .filter(([name, valve]) =>
            !valve.isOpen &&
            valve.flowRate > 0 &&
            time - distanceMap[location][name] - 1 > 0
        )
        .map(([name, nextValve]) => {
            const distance = distanceMap[location][name];
            const nextTime = time - distance - 1;
            const nextPath = [...path, name];

            const otherState = {
                ...state,
                valves: Object.fromEntries(Object.entries(valves).filter(([name]) => !nextPath.includes(name))),
                location: 'AA',
                time: 26,
                path: [],
                score: 0,
            }
            const otherScore = cached(otherState);

            return {
                ...state,
                location: name,
                time: nextTime,
                score: score + nextValve.flowRate * nextTime,
                otherScore,
                path: nextPath,
                valves: {
                    ...valves,
                    [name]: {
                        ...nextValve,
                        isOpen: true
                    }
                }
            }
        });

    return nextStates
        .map(maximizeFlowRate2)
        .reduce((max, state) =>
            state.score + state.otherScore > max.score + max.otherScore ?
                state :
                max,
            state
        );
}

export default function day16() {
    const input = readFileSync('./day16/input.txt', { encoding: 'utf8' });

    const valves = input.split('\n').reduce((valves, line) => {
        const [name, flowRate, connections] = line
            .match(/Valve (\w\w) has flow rate=(\d+); tunnels? leads? to valves? (.+)/)
            .slice(1);
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
        time: 26,
        path: [],
        // locations: ['AA', 'AA'],
        // times: [26, 26],
        score: 0,
        otherScore: 0,
        distanceMap: getDistanceMap(valves),
    };

    // const res = cached(initialState);
    // console.log(res.score);

    const start = new Date();

    const res = maximizeFlowRate2(initialState);
    console.log(res.score + res.otherScore, res.score, res.otherScore);

    const end = new Date();
    console.log(end - start);
}