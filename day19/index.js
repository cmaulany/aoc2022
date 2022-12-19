import { readFileSync } from 'fs';
import { type } from 'os';

const types = ['ore', 'clay', 'obsidian', 'geode'];

let cache = {};

function getNextStates(state) {
    const { time, costs, bots, resources } = state;
    const key = JSON.stringify([Object.values(bots), Object.values(resources)]);
    if (cache[key] && cache.time >= time) {
        return [];
    }

    let nextStates = []

    const robotTypes = types.filter((type) =>
        type === 'geode' ||
        Object.values(costs).some((cost) => {
            return bots[type] < cost[type]
        })
    );
    robotTypes.forEach((robotType) => {
        const times = types
            .filter((resourceType) => costs[robotType][resourceType] > 0)
            .map((resourceType) => {
                if (bots[resourceType] === 0) {
                    return Infinity;
                }
                if (resources[resourceType] >= costs[robotType][resourceType]) {
                    return 0;
                }
                return Math.ceil(
                    (costs[robotType][resourceType] - resources[resourceType]) / bots[resourceType]
                );
            });

        const delta = Math.max(...times) + 1;

        if (delta === Infinity || time - delta <= 0) {
            return;
        }

        nextStates.push({
            ...state,
            bots: {
                ...bots,
                [robotType]: bots[robotType] + 1,
            },
            resources: Object.fromEntries(types.map(
                (resourceType) => [
                    resourceType,
                    resources[resourceType] +
                    bots[resourceType] * delta -
                    costs[robotType][resourceType]
                ]
            )),
            time: time - delta,
        })
    });

    nextStates.push({
        ...state,
        resources: Object.fromEntries(types.map(
            (resourceType) => [
                resourceType,
                resources[resourceType] +
                bots[resourceType] * time
            ]
        )),
        time: 0,
    });

    cache[key] = { time, result: nextStates };

    return nextStates;
}

let cache2 = {};
function getFinalStates(state) {
    const { time, costs, bots, resources } = state;
    const key = JSON.stringify([time, Object.values(bots), Object.values(resources)]);
    if (cache2[key]) {
        return cache2[key];
    }

    const nextStates = getNextStates(state);

    const res = nextStates.flatMap((state) => state.time > 0 ? getFinalStates(state) : state);
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

    // console.log(state);

    // const nextStates = getNextStates(state);
    // console.log(JSON.stringify(nextStates, null, 4));

    // const finalStates = getFinalStates(state);

    // const geodes = finalStates.map((state) => state.resources.geode)
    // const best = geodes.reduce((max, geode) => Math.max(max, geode));
    // console.log(best);

    // 1
    const obs2 = blueprints.map((blueprint) => {
        cache = {};
        cache2 = {};

        console.log(blueprint.number);
        const state = {
            ...blueprint,
            time: 24,
            bots: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
            resources: types.reduce((resources, name) => ({ ...resources, [name]: 0 }), {}),
        };
        const finalStates = getFinalStates(state);
        const best = finalStates.map((state) => state.resources.geode).reduce((max, value) => Math.max(max, value));
        return best * blueprint.number;
    });

    // console.log(obs2);
    const sum2 = obs2.reduce((sum, x) => sum + x);
    console.log(sum2);

    // 2
    const obs = blueprints.slice(0, 3).map((blueprint) => {
        cache = {};
        cache2 = {};

        console.log(blueprint.number);
        const state = {
            ...blueprint,
            time: 32,
            bots: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
            resources: types.reduce((resources, name) => ({ ...resources, [name]: 0 }), {}),
        };
        const finalStates = getFinalStates(state);
        const best = finalStates.map((state) => state.resources.geode).reduce((max, value) => Math.max(max, value));
        return best;
    });

    console.log(obs);
    const sum = obs.reduce((sum, x) => sum * x);
    console.log(sum);
}