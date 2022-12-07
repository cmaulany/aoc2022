import { readFileSync } from 'fs';

function parseCommand([lines, state]) {
    const [head, ...tail] = lines;
    const [dollarSign, cmd, arg] = head;
    if (dollarSign !== '$') {
        throw 'Expected \'$\'';
    }

    let newState;
    let newLines;
    switch (cmd) {
        case 'cd':
            let newPath;
            if (arg === '/') {
                newPath = '/';
            } else if (arg === '..') {
                const index = state.path.match(/\w+\/$/).index
                newPath = state.path.slice(0, index);
            } else {
                newPath = state.path + arg + '/'
            }
            console.log(arg, state.path, newPath);
            newState = { ...state, path: newPath };
            newLines = tail;
            break;
        case 'ls':
            let endIndex = tail.findIndex(([firstSymbol]) => firstSymbol === '$');
            if (endIndex === -1) {
                endIndex = tail.length;
            }
            newState = tail.slice(0, endIndex).reduce((state, line) => {
                const [firstSymbol, name] = line;
                if (firstSymbol === 'dir') {
                    return {
                        ...state,
                        fileSystem: addDirectory(state.fileSystem, state.path + name + '/')
                    };
                }
                return {
                    ...state,
                    fileSystem: addFile(state.fileSystem, state.path + name + '/', Number(firstSymbol))
                };
            }, state);
            newLines = tail.slice(endIndex);
            break;
    }
    return [newLines, newState];
}

function addDirectory(fileSystem, path) {
    if (!path || path === '/') {
        return fileSystem ?? {
            type: 'dir',
            children: {}
        };
    }

    const [name, rest] = path.match(/\/(\w+)(.*)/)?.slice(1);

    return {
        ...fileSystem,
        children: {
            ...fileSystem?.children,
            [name]: addDirectory(fileSystem?.children[name], rest),
        }
    }
}

function addFile(fileSystem, path, size) {
    if (!path || path === '/') {
        return fileSystem ?? {
            type: 'file',
            size,
            children: {}
        };
    }
    const [name, rest] = path.match(/\/([\w\.]+)(.*)/)?.slice(1);

    return {
        ...fileSystem,
        children: {
            ...fileSystem?.children,
            [name]: addFile(fileSystem?.children[name], rest, size),
        }
    }
}

function calculateSize(fileSystem) {
    const { type, children = {} } = fileSystem;
    if (type === 'file') {
        return fileSystem;
    }

    const newChildren = Object.entries(children).reduce((newChildren, [key, value]) => {
        newChildren[key] = calculateSize(value);
        return newChildren;
    }, {});

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
        path: '/',
        fileSystem: {
            type: 'dir',
            children: {}
        },
    };

    let s = [lines, initialState];
    while (s[0].length > 0) {
        s = parseCommand(s);
    }
    s = calculateSize(s[1].fileSystem);

    console.log(JSON.stringify(s));
    const result = getDirectoriesWhere(s, (dir) => dir.size <= 100_000);
    const r = result.reduce((sum, dir) => sum + dir.size, 0);

    // const total = calculateSize(s[1].fileSystem);
    console.log(result.map((dir) => dir.size).filter((size) => size <= 100_000 && size > 0));
    console.log(r);

    const requiredSpace = (70_000_000 - 30_000_000 - s.size) * -1;
    console.log("RR", requiredSpace);

    const result2 = getDirectoriesWhere(s, (dir) => dir.size >= requiredSpace);
    const smallest = result2.reduce((min, dir) => dir.size < min.size ? dir : min);
    console.log(smallest);
}