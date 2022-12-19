import { readFileSync } from 'fs';

const types = ['ore', 'clay', 'obsidian', 'geode'];

const cache = {};

function getNextStates(state) {
    const { time, costs, bots, resources } = state;
    const key = JSON.stringify([time, Object.values(costs), Object.values(bots), Object.values(resources)]);
    if (cache[key]) {
        return cache[key];
    }

    const types = Object.keys(costs);

    const buildType = types.reverse().find((robotType) =>
        types.every((resourceType) =>
            resources[resourceType] >= costs[robotType][resourceType]
        )
    );

    const nextStates = (buildType ? [buildType] : [])
        .filter((robotType) =>
            types.every((resourceType) =>
                resources[resourceType] >= costs[robotType][resourceType]
            )
        )
        .map((robotType) => ({
            ...state,
            bots: {
                ...bots,
                [robotType]: bots[robotType] + 1,
            },
            resources: Object.fromEntries(types.map(
                (resourceType) => [
                    resourceType,
                    resources[resourceType] +
                    bots[resourceType] -
                    costs[robotType][resourceType]
                ]
            )),
            time: time - 1,
        }));

    nextStates.push({
        ...state,
        resources: Object.fromEntries(types.map(
            (type) => [type, resources[type] + bots[type]]
        )),
        time: time - 1,
    });

    cache[key] = nextStates;

    return nextStates;
}

const cache2 = {};
function getFinalStates(state) {
    const { time, costs, bots, resources } = state;
    const key = JSON.stringify([time, Object.values(costs), Object.values(bots), Object.values(resources)]);
    if (cache2[key]) {
        return cache2[key];
    }

    const nextStates = getNextStates(state);
    if (state.time === 1) {
        return nextStates;
    }

    const res = nextStates.flatMap(getFinalStates);
    cache2[key] = res;

    return res
}


export default function day19() {
    const input = readFileSync('./day19/input.txt', { encoding: 'utf8' });

    const blueprints = input.trim().split(/\n/).map((line) => {
        const parts = line.trim().split(/\.|:/g).map((part) => part.trim()).slice(0, -1);
        const mapped = parts.slice(1).map((part) => {
            const [type, rest] = part.match(/Each (\w+) robot costs (.+)/).slice(1);

            const resources = rest.match(/\d+ \w+/g).map((com) => {
                const [cost, type] = com.split(' ');
                return [type, Number(cost)];
            });
            return [type, Object.fromEntries(types.map((type) => [type, 0]).concat(resources))];
        });
        const costs = Object.fromEntries(mapped);
        return {
            number: Number(parts[0].match(/\d+/)),
            costs,
        };
    });

    const obs = blueprints.reverse().map((blueprint) => {
        const state = {
            ...blueprint,
            time: 24,
            bots: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
            resources: types.reduce((resources, name) => ({ ...resources, [name]: 0 }), {}),
        };
        const finalStates = getFinalStates(state);
        const best = finalStates.map((state) => state.resources.geode).reduce((max, value) => Math.max(max, value));
        return best;
    });

    // console.log(JSON.stringify(finalStates, null, 4));

    console.log(obs);
    // console.log(state);
    // const finalStates = getFinalStates(state);
    // console.log(finalStates.length);

    /**
     * Calculate point at which you can build someting.
     * Jump to these points
     */
}