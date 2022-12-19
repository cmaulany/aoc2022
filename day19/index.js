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

    const usefullTypes = types.filter((type) =>
        type === 'geode' ||
        Object.values(costs).some((cost) => {
            return resources[type] < cost[type]
        })
    );

    const nextStates = usefullTypes
        .map((type) => [type, timeUntillBotCanBeBuilt(state, type) + 1])
        .filter(([_, delta]) =>
            delta !== Infinity &&
            time - delta > 0
        )
        .map(([type, delta]) => ({
            ...state,
            bots: {
                ...bots,
                [type]: bots[type] + 1,
            },
            resources: Object.fromEntries(types.map((resourceType) => [
                resourceType,
                resources[resourceType] +
                bots[resourceType] * delta -
                costs[type][resourceType]
            ])),
            time: time - delta,
        }));

    return nextStates;
}

function findMaximumGeodes(state) {
    let max = 0;

    const open = [state];
    while (open.length > 0) {
        const current = open.pop();
        max = Math.max(current.resources.geode + current.bots.geode * current.time, max);
        open.push(...getNextStates(current));
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

    const initialState = {
        bots: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
        resources: { ore: 0, clay: 0, obsidian: 0, geode: 0 },
    };

    const qualityLevels = blueprints.map((blueprint) => {
        const max = findMaximumGeodes({
            ...initialState,
            ...blueprint,
            time: 24,
        });
        return max * blueprint.number;
    });
    const qualityLevelSum = qualityLevels.reduce((sum, x) => sum + x);
    console.log(`Answer part 1: ${qualityLevelSum}`);

    const geodes = blueprints.slice(0, 3).map((blueprint) => findMaximumGeodes({
        ...initialState,
        ...blueprint,
        time: 32,
    }));
    const product = geodes.reduce((product, geode) => product * geode);
    console.log(`Answer part 2: ${product}`);
}