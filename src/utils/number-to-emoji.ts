export const numberToEmoji = (n: number) => {
    const emojis = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
    return n < 10
        ? emojis[n]
        : n
              .toString()
              .split("")
              .map((d) => emojis[+d])
              .join("");
};
