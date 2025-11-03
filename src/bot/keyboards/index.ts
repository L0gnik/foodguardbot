import { calendarInlineKeyboard } from "./inline-keyboard-calendar";
import { listInlineKeyboard } from "./inline-keyboard-product-names";
import { remindAtInlineKeyboard } from "./inline-keyboard-remind-at";

export * from "./inline-keyboard-remind-at";

export const inlineKeyboard = {
    list: listInlineKeyboard,
    calendar: calendarInlineKeyboard,
    remindAt: remindAtInlineKeyboard,
};
