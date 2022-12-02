import { readFileSync } from 'fs';

const options2 = {
    A: {
        name: 'Rock',
        beats: 'Z',
        score: 1,
    },
    B: {
        name: 'Paper',
        beats: 'X',
        score: 2,
    },
    C: {
        name: 'Scissor',
        beats: 'Y',
        score: 3
    },
    X: {
        name: 'Rock',
        beats: 'C',
        score: 1,
    },
    Y: {
        name: 'Paper',
        beats: 'A',
        score: 2,
    },
    Z: {
        name: 'Scissor',
        beats: 'B',
        score: 3
    }
}

const options = {
    A: {
        name: 'Rock',
        beats: 'Z',
        score: 1,
    },
    B: {
        name: 'Paper',
        beats: 'X',
        score: 2,
    },
    C: {
        name: 'Scissors',
        beats: 'Y',
        score: 3
    },
    X: {
        name: 'Rock',
        beats: 'C',
        score: 1,
    },
    Y: {
        name: 'Paper',
        beats: 'A',
        score: 2,
    },
    Z: {
        name: 'Scissors',
        beats: 'B',
        score: 3
    }
}

// X: Lose,
// Y: Draw
// Z: Win

function getScore2(round) {
    const hasWon = options[round.you].beats === round.opponent;
    const hasLost = options[round.opponent].beats === round.you;


    let outcomeScore;
    if (hasWon) {
        outcomeScore = 6;
    }
    else if (hasLost) {
        outcomeScore = 0;
    }
    else {
        outcomeScore = 3;
    }

    const score = outcomeScore + options[round.you].score;
    console.log(round, hasWon, hasLost, options[round.you], score);

    return score;
}

const handMap = {
    'A': {
        'Win': 'Y',
        'Draw': 'X',
        'Lose': 'Z'
    },
    'B': {
        'Win': 'Z',
        'Draw': 'Y',
        'Lose': 'X'
    },
    'C': {
        'Win': 'X',
        'Draw': 'Z',
        'Lose': 'Y'
    }
}

function getScore(round) {
    const desiredOutcome =
        round.you === 'X' ?
            'Lose' :
            round.you === 'Y' ?
                'Draw' :
                'Win';
    const newRound = {
        ...round,
        you: handMap[round.opponent][desiredOutcome]
    }

    return getScore2(newRound);
}

export default function day2() {
    const input = readFileSync('./day2/input.txt', { encoding: 'utf8' });

    const rounds = input.split('\n').map((line) => {
        const [opponent, you] = line.split(' ');
        return {
            opponent,
            you
        };
    })

    console.log(rounds);

    const finalScore = rounds.map(getScore).reduce((sum, score) => sum + score);

    console.log(finalScore);
}