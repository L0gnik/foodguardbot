import { find } from "geo-tz";

export const getTimezoneByLocation = (location: {
    latitude: number;
    longitude: number;
}): string => {
    const [timezone] = find(location.latitude, location.longitude);
    return timezone;
};
