import ct, { CountryCode } from "countries-and-timezones";

export function getTimezoneByCountry(countryCode: CountryCode): ct.Timezone[] {
    const timezones = ct.getTimezonesForCountry(countryCode);
    return timezones;
}
