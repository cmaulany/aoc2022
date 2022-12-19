import { readFileSync } from 'fs';

const types = ['ore', 'clay', 'obsidian', 'geode'];

function timeUntillBotCanBeBuilt(state, type) {
    const { costs, bots, resources } = state;
    const times = types
        .filter((resourceType) => costs[type][resourceType] > 0)
        .map((resourceType) => {
            if (resources[resourceType] >= costs[type][resourceType]) {
                return 0;
            }
            if (bots[resourceType] === 0) {
                return Infinity;
            }
            return Math.ceil(
                (costs[type][resourceType] - resources[resourceType]) / bots[resourceType]
            );
        });

    return Math.max(...times);
}

function getNextStates(state) {
    const { time, costs, bots, resources } = state;

    const nextStates = types
        .map((type) => [type, timeUntillBotCanBeBuilt(state, type) + 1])
        .filter(([type, delta]) =>
            delta !== Infinity &&
            time - delta > 0 &&
            (
                type === 'geode' ||
                Object.values(costs).some((cost) => {
                    return bots[type] < cost[type]
                })
            )
        )
        .map(([type, delta]) => ({
            ...state,
            bots: {
                ...bots,
                [type]: bots[type] + 1,
            },
            resources: Object.fromEntries(types.map(
                (resourceType) => [
                    resourceType,
                    resources[resourceType] +
                    bots[resourceType] * delta -
                    costs[type][resourceType]
                ]
            )),
            time: time - delta,
        }));

    if (nextStates.length > 0) {
        return nextStates;
    }

    return [{
        ...state,
        resources: Object.fromEntries(types.map(
            (type) => [
                type,
                resources[type] +
                bots[type] * time
            ]
        )),
        time: 0,
    }];
}

function dfs(state) {
    let max = 0;

    const open = [state];
    let i = 0;
    while (open.length > 0) {
        i++;
        const current = open.pop();
        if (current.time === 0) {
            max = Math.max(current.resources.geode + current.bots.geode * current.time, max);
            continue;
        }
        open.push(...getNextStates(current));

        if ( i > 78738) {
            // console.log(i);
        }
    }

    return max;
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

    // 1
    const obs2 = blueprints.map((blueprint) => {
        console.log(blueprint.number);
        const state = {
            ...blueprint,
            time: 24,
            bots: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
            resources: types.reduce((resources, name) => ({ ...resources, [name]: 0 }), {}),
        };
        const best = dfs(state);
        return best * blueprint.number;
    });

    const sum2 = obs2.reduce((sum, x) => sum + x);
    console.log(sum2);

    // 2
    // const obs = blueprints.slice(0, 3).map((blueprint) => {
    //     console.log(blueprint.number);
    //     const state = {
    //         ...blueprint,
    //         time: 32,
    //         bots: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
    //         resources: types.reduce((resources, name) => ({ ...resources, [name]: 0 }), {}),
    //     };
    //     const best = dfs(state);
    //     return best;
    // });

    // console.log(obs);
    // const sum = obs.reduce((sum, x) => sum * x);
    // console.log(sum);
}