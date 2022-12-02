import { readFileSync } from 'fs';

const options = {
    Rock: {
        beats: 'Scissors',
        score: 1,
    },
    Paper: {
        beats: 'Rock',
        score: 2,
    },
    Scissors: {
        beats: 'Paper',
        score: 3
    }
};

function getOutcome(round) {
    const { you, opponent } = round;

    const hasWon = options[you].beats === opponent;
    const hasLost = options[opponent].beats === you;

    if (hasWon) {
        return 'Win';
    }
    else if (hasLost) {
        return 'Lose';
    }
    return 'Draw';
}

function getScore(round) {
    const outcomeScore = {
        Win: 6,
        Lose: 0,
        Draw: 3
    }[getOutcome(round)];

    const handScore = options[round.you].score;

    const score = outcomeScore + handScore;

    return score;
}

function getHand(oponent, desiredOutcome) {
    return {
        Rock: {
            Win: 'Paper',
            Draw: 'Rock',
            Lose: 'Scissors'
        },
        Paper: {
            Win: 'Scissors',
            Draw: 'Paper',
            Lose: 'Rock'
        },
        Scissors: {
            Win: 'Rock',
            Draw: 'Scissors',
            Lose: 'Paper'
        }
    }[oponent][desiredOutcome];
}

export default function day2() {
    const input = readFileSync('./day2/input.txt', { encoding: 'utf8' });

    const guide = input.split('\n').map((line) => line.split(' '));

    const roundsPart1 = guide.map(([left, right]) => {
        const opponent = {
            A: 'Rock',
            B: 'Paper',
            C: 'Scissors',
        }[left];

        const you = {
            X: 'Rock',
            Y: 'Paper',
            Z: 'Scissors'
        }[right];

        return {
            opponent,
            you
        };
    });

    const roundsPart2 = guide.map(([left, right]) => {
        const opponent = {
            A: 'Rock',
            B: 'Paper',
            C: 'Scissors',
        }[left];

        const desiredOutcome = {
            X: 'Lose',
            Y: 'Draw',
            Z: 'Win'
        }[right];
        const you = getHand(opponent, desiredOutcome);

        return {
            opponent,
            you
        };
    });

    const finalScorePart1 = roundsPart1.map(getScore).reduce((sum, score) => sum + score);
    const finalScorePart2 = roundsPart2.map(getScore).reduce((sum, score) => sum + score);

    console.log(`Answer part 1: ${finalScorePart1}`);
    console.log(`Answer part 2: ${finalScorePart2}`);
}