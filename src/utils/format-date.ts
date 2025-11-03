import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/ru";
import { TimezoneName } from "countries-and-timezones";

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDateToDDMMMMYYYY = (
    date: Date,
    tz: string = "Europe/Moscow",
    locale: "ru" = "ru"
) => {
    return dayjs(date).tz(tz).locale(locale).format("DD MMMM YYYY");
};
export const formatDateToDDMMYYYYHHmm = (
    date: Date,
    tz: string = "Europe/Moscow",
    locale: "ru" = "ru"
) => {
    return dayjs(date).tz(tz).locale(locale).format("DD.MM.YYYY HH:mm");
};
export const formatDateToDDMMYYYY = (
    date: Date,
    tz: string = "Europe/Moscow",
    locale: "ru" = "ru"
) => {
    return dayjs(date).tz(tz).locale(locale).format("DD.MM.YYYY");
};
