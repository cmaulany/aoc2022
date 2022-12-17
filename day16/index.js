import { readFileSync } from 'fs';

function getDistances(valves, location) {
    const distances = { [location]: 0 };
    const open = [location];
    while (open.length > 0) {
        const location = open.shift()
        const valve = valves[location];

        const neighbors = valve.connections.filter((connection) => !distances.hasOwnProperty(connection));

        neighbors.forEach((connection) => distances[connection] = distances[location] + 1)
        open.push(...neighbors);
    }
    return distances;
}

function getDistanceMap(valves) {
    const map = {};
    Object.keys(valves).forEach((location) =>
        map[location] = getDistances(valves, location)
    );
    return map;
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

    const nextStates = Object.values(valves)
        .filter((valve) =>
            valve.flowRate > 0 &&
            time - distanceMap[location][valve.name] - 1 > 0 &&
            !path.includes(valve.name)
        )
        .map((valve) => {
            const distance = distanceMap[location][valve.name];
            const nextTime = time - distance - 1;
            return {
                ...state,
                location: valve.name,
                time: nextTime,
                score: score + valve.flowRate * nextTime,
                path: [...path, valve.name],
            }
        });

    return nextStates.length === 0 ?
        {
            time,
            valves,
            location,
            score,
            path,
            distanceMap,
        } :
        nextStates.flatMap(getFinalStates);
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

    const sortedFinalStates = getFinalStates({
        valves,
        time: 26,
        distanceMap,
    }).sort((a, b) => b.score - a.score);

    const combinedScores = sortedFinalStates.map((you) => {
        const elephant = sortedFinalStates.find((state) => state.path.every(
            (location) => !you.path.includes(location)
        ));
        return you.score + elephant.score;
    });
    const maxCombinedScore = Math.max(...combinedScores);

    console.log(`Answer part 2: ${maxCombinedScore}`);
}