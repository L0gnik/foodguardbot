export const BOT_COMMANDS = {
    START: /\/start/,
    ADD: /➕ Добавить/,
    LIST: /(\/list|📋 Список)/,
    DELETE: /🗑 Удалить/,
    SETTINGS: /(\/settings|⚙️ Настройки)/,
    MENU: /(\/menu|⚙️ Меню)/,
} as const;

export enum CALLBACK_QUERY_ACTION {
    ECHO = "ECHO",
    USER_CHANGE_TZ = "ChUsTz",
    USER_SET_TZ = "StUsTz",
    SEND_CALENDAR_FOR_PRODUCT_EXPIRE_DATE = "PrNmTCr",
    DELETE_PRODUCT = "DltPrdct",
    CHANGE_CALENDAR_MONTH = "ClndrStMnth",
    ASK_PRODUCT_REMIND_DATE = "StClndrDt",
    CREATE_PRODUCT_AND_REMINDER = "RmrStExDt",
}

export const CALLBACK_QUERY_DATA_MAP = {
    [CALLBACK_QUERY_ACTION.ECHO]: ["message"],
    [CALLBACK_QUERY_ACTION.USER_CHANGE_TZ]: ["timezone"],
    [CALLBACK_QUERY_ACTION.USER_SET_TZ]: ["timezone", "offset"],
    [CALLBACK_QUERY_ACTION.DELETE_PRODUCT]: ["productName", "id"],
    [CALLBACK_QUERY_ACTION.SEND_CALENDAR_FOR_PRODUCT_EXPIRE_DATE]: [
        "productName",
        "id",
    ],
    [CALLBACK_QUERY_ACTION.CHANGE_CALENDAR_MONTH]: [
        "previousMounth",
        "month",
        "year",
        "timezone",
        "productName",
    ],
    [CALLBACK_QUERY_ACTION.ASK_PRODUCT_REMIND_DATE]: [
        "day",
        "month",
        "year",
        "timezone",
        "productName",
    ],
    [CALLBACK_QUERY_ACTION.CREATE_PRODUCT_AND_REMINDER]: [
        "day",
        "month",
        "year",
        "timezone",
        "hoursUntilExpire",
        "productName",
    ],
} as const;

export type CALLBACK_QUERY_DATA = {
    [K in keyof typeof CALLBACK_QUERY_DATA_MAP]: {
        [T in (typeof CALLBACK_QUERY_DATA_MAP)[K][number]]: string;
    };
};

export const buildCallbackData = <Key extends CALLBACK_QUERY_ACTION>(
    key: Key,
    data: CALLBACK_QUERY_DATA[Key]
) => {
    const callbackData = CALLBACK_QUERY_DATA_MAP[key]
        .map((item) => data[item as keyof CALLBACK_QUERY_DATA[Key]])
        .join("|");
    const result = `${key}|${callbackData}`;
    if (result.length > 64)
        throw new Error("callbackData exceeded by 64 characters ");
    return `${key}|${callbackData}`;
};

export const parseCallbackData = <Type extends CALLBACK_QUERY_ACTION>(
    string: string
): { type: Type; callbackData: CALLBACK_QUERY_DATA[Type] } => {
    const [type, ...data] = string.split("|");
    const callbackData = Object.fromEntries(
        CALLBACK_QUERY_DATA_MAP[type as CALLBACK_QUERY_ACTION].map(
            (item, index) => {
                return [item, data[index]];
            }
        )
    );
    return { type, callbackData } as {
        type: Type;
        callbackData: CALLBACK_QUERY_DATA[Type];
    };
};
