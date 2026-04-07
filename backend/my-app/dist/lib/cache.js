import { client } from "./redis.js";
export async function setCachingData(userId, data, time, timeRange, setting) {
    await client.set(`user:${userId}:${setting}:${timeRange}`, JSON.stringify(data), { EX: time });
}
export async function getCachingData(userId, timeRange, setting) {
    const res = await client.get(`user:${userId}:${setting}:${timeRange}`);
    if (!res) {
        return null;
    }
    return JSON.parse(res);
}
