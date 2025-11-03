export const getTimezoneOffset = (timezone: string): string => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find((p) => p.type === "timeZoneName");
    return offsetPart?.value.replace("GMT", "UTC") || "UTC";
};
