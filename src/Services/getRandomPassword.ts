export function getRandomPassword(): string {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = lower.toUpperCase();
    const digits = "0123456789";
    const symbols = "~!@#$%^&*()_+=-`";

    const length = getRandom(9, 18);
    const password: string[] = [];

    password.push(getRandomChar(lower));
    password.push(getRandomChar(upper));
    password.push(getRandomChar(digits));
    password.push(getRandomChar(symbols));

    const remainingLength = length - 4;

    const quotas = {
        lower: Math.floor(remainingLength * 0.45),
        upper: Math.floor(remainingLength * 0.35),
        digits: Math.floor(remainingLength * 0.22),
        symbols: remainingLength
    };
    quotas.symbols -= quotas.lower + quotas.upper + quotas.digits;

    password.push(...pickMultiple(lower, quotas.lower));
    password.push(...pickMultiple(upper, quotas.upper));
    password.push(...pickMultiple(digits, quotas.digits));
    password.push(...pickMultiple(symbols, quotas.symbols));
    const shuffled= shuffle(password);
    
    shuffled.unshift(getRandomChar(getRandom(0,1)>0?lower:upper))
    return shuffled.join("");
}

function getRandom(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomChar(pool: string): string {
    return pool[getRandom(0, pool.length - 1)];
}

function pickMultiple(pool: string, count: number): string[] {
    const chars: string[] = [];
    for (let i = 0; i < count; i++) {
        chars.push(getRandomChar(pool));
    }
    return chars;
}

function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = getRandom(0, i);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
