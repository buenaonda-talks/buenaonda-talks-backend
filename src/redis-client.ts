import { createClient } from 'redis';
import { env } from './env';

export const getRedisClient = async () => {
    const {
        REDIS: { HOST, PORT, PASSWORD },
    } = env;

    const redisClient = createClient({
        url: `redis://${HOST}:${PORT}`,
        password: PASSWORD,
    });
    await redisClient.connect();

    return redisClient;
};
