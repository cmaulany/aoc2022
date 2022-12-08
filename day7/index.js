import { readFileSync } from 'fs';

function reduceCommand(state) {
    const { lines, path, fileSystem } = state;

    const [head, ...tail] = lines;
    const [dollarSign, cmd, arg] = head;

    if (dollarSign !== '$') {
        throw 'Expected \'$\'';
    }

    switch (cmd) {
        case 'cd':
            return {
                ...state,
                path: changeDirectory(path, arg),
                lines: tail
            };
        case 'ls':
            const findIndex = tail.findIndex(([firstSymbol]) => firstSymbol === '$');
            const endIndex = findIndex >= 0 ? findIndex : tail.length;

            const newFileSystem = tail.slice(0, endIndex).reduce((fileSystem, line) => {
                const [firstSymbol, name] = line;

                const entity =
                    firstSymbol === 'dir' ?
                        { type: 'dir', children: {} } :
                        { type: 'file', size: Number(firstSymbol) };

                return add(fileSystem, path + name + '/', entity);
            }, fileSystem);

            return {
                ...state,
                lines: tail.slice(endIndex),
                fileSystem: newFileSystem
            };
    }
}

function changeDirectory(path, arg) {
    if (arg === '/') {
        return '/';
    } else if (arg === '..') {
        const index = path.match(/\w+\/$/).index;
        return path.slice(0, index);
    } else {
        return path + arg + '/';
    }
}

function add(fileSystem, path, entity) {
    if (path === '/') {
        return entity;
    }

    const [name, rest] = path.match(/\/([\w\.]+)(.*)/)?.slice(1);

    return {
        ...fileSystem,
        children: {
            ...fileSystem?.children,
            [name]: add(fileSystem?.children[name], rest, entity),
        }
    };
}

function calculateSize(fileSystem) {
    const { type, children } = fileSystem;
    if (type === 'file') {
        return fileSystem;
    }

    const newChildren = Object.entries(children).reduce((newChildren, [key, value]) => ({
        ...newChildren,
        [key]: calculateSize(value)
    }), {});

    const size = Object.values(newChildren).reduce((sum, child) => sum + child.size, 0);

    return {
        ...fileSystem,
        size,
        children: newChildren
    };
}

function getDirectoriesWhere(fileSystem, comparator) {
    if (fileSystem.type === "file") {
        return [];
    }

    const childDirectories = Object.values(fileSystem.children ?? {}).reduce(
        (agg, child) => [...agg, ...getDirectoriesWhere(child, comparator)],
        []
    );

    if (!comparator(fileSystem)) {
        return childDirectories;
    }

    return [
        fileSystem,
        ...childDirectories
    ];
}

export default function day7() {
    const input = readFileSync('./day7/input.txt', { encoding: 'utf8' });

    const lines = input.split(/\r?\n/).map((line) => line.split(' '));

    const initialState = {
        lines,
        path: '/',
        fileSystem: {
            type: 'dir',
            children: {}
        },
    };

    let state = initialState;
    while (state.lines.length > 0) {
        state = reduceCommand(state);
    }
    const fileSystem = calculateSize(state.fileSystem);

    const directoriesSmallerThan100k = getDirectoriesWhere(fileSystem, (dir) => dir.size <= 100_000);
    const summedDirectories = directoriesSmallerThan100k.reduce((sum, dir) => sum + dir.size, 0);
    console.log(`Answer part 1: ${summedDirectories}`);

    const additionalRequiredSpace = 30_000_000 - 70_000_000 + fileSystem.size;
    const consideredDirectories = getDirectoriesWhere(fileSystem, (dir) => dir.size >= additionalRequiredSpace);
    const smallestDirectory = consideredDirectories.reduce((min, dir) => dir.size < min.size ? dir : min);
    console.log(`Answer part 2: ${smallestDirectory.size}`);
}