export function validateString(
    str?: string,
    minLength = 1,
    maxLength = 255
): string {
    if (typeof str !== "string") {
        throw "Значение не является строкой";
    }

    const trimmedStr = str.trim();

    if (trimmedStr.length === 0) {
        throw `Строка не должна быть пустой`;
    }
    if (trimmedStr.length < minLength) {
        throw `Минимальная длина строки должна быть не меньше чем ${minLength} символов`;
    }
    if (trimmedStr.length > maxLength) {
        throw `Максимальная длина строки должна быть не больше чем ${maxLength} символов`;
    }
    if (/\s{2,}/.test(str)) {
        throw "Неверное значение строки";
    }

    return str;
}
