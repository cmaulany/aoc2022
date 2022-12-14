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

const toKey = ({ time, costs, bots, resources }) => [
    time,
    ...types.flatMap((botType) =>
        types.flatMap((resourceType) => costs[botType][resourceType])
    ),
    ...types.map((type) => bots[type]),
    ...types.map((type) => resources[type])
].toString();

function getNextStates(state) {
    const { time, costs, bots, resources } = state;

    const maxSpendRates = Object.fromEntries(types.map((resourceType) => [
        resourceType,
        Math.max(
            ...types.map((robotType) => costs[robotType][resourceType])
        )
    ]));
    maxSpendRates.geode = Infinity;

    const usefullTypes = types.filter((type) =>
        resources[type] + bots[type] * (time - 1) <=
        maxSpendRates[type] * (time - 1)
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
                Math.min(
                    resources[resourceType] +
                    bots[resourceType] * delta -
                    costs[type][resourceType],
                    maxSpendRates[resourceType] * (time - delta + 1),
                )
            ])),
            time: time - delta,
        }));

    return nextStates;
}

function findMaximum(state, type) {
    let max = 0;

    const visitedStates = {};
    const open = [state];
    while (open.length > 0) {
        const current = open.pop();

        const key = toKey(current);
        if (visitedStates[key]) {
            continue;
        }
        visitedStates[key] = true;

        const { resources, bots, time } = current;
        max = Math.max(max, resources[type] + bots[type] * time);

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
        const max = findMaximum({
            ...initialState,
            ...blueprint,
            time: 24,
        }, 'geode');
        return max * blueprint.number;
    });
    const qualityLevelSum = qualityLevels.reduce((sum, x) => sum + x);
    console.log(`Answer part 1: ${qualityLevelSum}`);

    const geodes = blueprints.slice(0, 3).map((blueprint) => findMaximum({
        ...initialState,
        ...blueprint,
        time: 32,
    }, 'geode'));
    const product = geodes.reduce((product, geode) => product * geode);
    console.log(`Answer part 2: ${product}`);
}