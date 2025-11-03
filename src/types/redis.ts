export enum REDIS_STEP {
    ASK_PRODUCT_NAME_TO_ADD = 'AskPrNmToAdd',
    ASK_EXPIRE_DATE_TO_PRODUCT = 'AskExpDtToPrdct',
    ASK_REMIND_AT_TO_PRODUCT = 'AskRmndAtToPrdct',
    ASK_LOCATION_TO_SET_TIMEZONE = 'AskLctnToStTz',
}

export type RedisClientState = Record<"step", REDIS_STEP>;
