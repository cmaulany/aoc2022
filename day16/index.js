import { readFileSync } from 'fs';

function getDistanceMap(valves) {
    const map = {};
    Object.keys(valves).forEach((location) =>
        map[location] = getDistances(valves, location)
    );
    return map;
}

function getDistances(valves, location) {
    const score = { [location]: 0 };
    const open = [location];
    while (open.length > 0) {
        const location = open.shift()
        const valve = valves[location];

        const neighbors = valve.connections.filter((connection) => !score.hasOwnProperty(connection));

        neighbors.forEach((connection) => score[connection] = score[location] + 1)
        open.push(...neighbors);
    }
    return score;
}

function getFinalStates(state) {
    const {
        time = 30,
        valves,
        location = 'AA',
        score = 0,
        path = [],
        distanceMap,
    } = state;

    const nextStates = Object.entries(valves)
        .filter(([name, valve]) =>
            !valve.isOpen &&
            valve.flowRate > 0 &&
            time - distanceMap[location][name] - 1 > 0 &&
            !path.includes(name)
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
            }
        });

    return [
        {
            time,
            valves,
            location,
            score,
            path,
            distanceMap,
        },
        ...nextStates.flatMap(getFinalStates),
    ];
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

    const distanceMap = getDistanceMap(valves);

    const allScores = getFinalStates({
        valves,
        distanceMap,
    }).map((state) => state.score);
    const maxScore = allScores.reduce((max, score) => Math.max(max, score));

    console.log(`Answer part 1: ${maxScore}`);

    const sortedScores = getFinalStates({
        valves,
        time: 26,
        distanceMap,
    }).sort((a, b) => b.score - a.score);

    const combinedScores = sortedScores.map((you) => {
        const elephant = sortedScores.find((state) => state.path.every(
            (location) => !you.path.includes(location)
        ));
        return you.score + elephant.score;
    });
    const bestCombinedScore = Math.max(...combinedScores);

    console.log(`Answer part 2: ${bestCombinedScore}`);
}