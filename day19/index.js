import { readFileSync } from 'fs';

const types = ['ore', 'clay', 'obsidian', 'geode'];

function getNextStates(state) {
    const { time, costs, bots, resources } = state;

    const isDone = types.every((type) => bots[type] >= costs.geode[type]);
    if (isDone) {
        const t = time - 1
        const extra = t * (t + 1) * 0.5;
        return [{
            ...state,
            time: 0,
            resources: {
                ...resources,
                geode: resources.geode + extra,
            }
        }];
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

    if (nextStates.length === 0) {
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
    }

    return nextStates;
}

function dfs(state) {
    let max = 0;

    const seen = {};
    const open = [state];
    while (open.length > 0) {
        const current = open.pop();
        const key = JSON.stringify([Object.values(current.bots), Object.values(current.resources)]);

        if (seen[key] >= current.time) {
            continue;
        }

        if (current.time === 0) {
            max = Math.max(current.resources.geode, max);
            continue;
        }

        seen[key] = current.time;

        const nextStates = getNextStates(current);

        open.push(...nextStates);
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
    const obs = blueprints.slice(0, 3).map((blueprint) => {
        console.log(blueprint.number);
        const state = {
            ...blueprint,
            time: 32,
            bots: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
            resources: types.reduce((resources, name) => ({ ...resources, [name]: 0 }), {}),
        };
        const best = dfs(state);
        return best;
    });

    console.log(obs);
    const sum = obs.reduce((sum, x) => sum * x);
    console.log(sum);
}