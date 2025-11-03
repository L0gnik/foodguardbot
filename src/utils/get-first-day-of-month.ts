import dayjs from "dayjs";

export function getFirstDayOfMonth(year: number, month: number): number {
    const firstDay = dayjs(new Date(year, month, 1)).locale("ru");
    const dayOfWeek = firstDay.day();
    return dayOfWeek === 0 ? 7 : dayOfWeek;
}
