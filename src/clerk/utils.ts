import { usernameNouns } from './data/nouns';
import { usernameAdjectives } from './data/adjectives';

type Style = 'lowerCase' | 'upperCase' | 'capital';

export interface Config {
    dictionaries: string[][];
    separator?: string;
    randomDigits?: number;
    length?: number;
    style?: Style;
}

// Function to generate a random number within a given range
const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

const randomNumber = (maxNumber: number | undefined) => {
    let randomNumberString;
    switch (maxNumber) {
        case 1:
            randomNumberString = Math.floor(getRandomInt(1, 9)).toString();
            break;
        case 2:
            randomNumberString = Math.floor(getRandomInt(10, 90)).toString();
            break;
        case 3:
            randomNumberString = Math.floor(getRandomInt(100, 900)).toString();
            break;
        case 4:
            randomNumberString = Math.floor(getRandomInt(1000, 9000)).toString();
            break;
        case 5:
            randomNumberString = Math.floor(getRandomInt(10000, 90000)).toString();
            break;
        case 6:
            randomNumberString = Math.floor(getRandomInt(100000, 900000)).toString();
            break;
        default:
            randomNumberString = '';
            break;
    }
    return randomNumberString;
};

export function generateUsernameFromEmail(email: string, randomDigits?: number): string {
    // Retrieve name from email address
    const nameParts = email.replace(/@.+/, '');
    // Replace all special characters like "@ . _ ";
    const name = nameParts.replace(/[&/\\#,+()$~%._@'":*?<>{}]/g, '');
    // Create and return unique username
    return name + randomNumber(randomDigits);
}

export function generateUsername(
    separator?: string,
    randomDigits?: number,
    length?: number,
    prefix?: string,
): string {
    const noun = usernameNouns[Math.floor(Math.random() * usernameNouns.length)];
    const adjective = prefix
        ? prefix
              .replace(/\s{2,}/g, ' ')
              .replace(/\s/g, separator ?? '')
              .toLocaleLowerCase()
        : usernameAdjectives[Math.floor(Math.random() * usernameAdjectives.length)];

    let username;
    // Create unique username
    if (separator) {
        username = adjective + separator + noun + randomNumber(randomDigits);
    } else {
        username = adjective + noun + randomNumber(randomDigits);
    }

    if (length) {
        return username.substring(0, length);
    }

    return username;
}
