import { env } from '@/env';
import { getRedisClient } from '@/redis-client';

class ZoomAPI {
    private static readonly ZOOM_BASE_URL = 'https://zoom.us';

    public static getAuthBasicString(clientId: string, clientSecret: string): string {
        const credentials = `${clientId}:${clientSecret}`;
        const asBase64 = Buffer.from(credentials).toString('base64');
        return `Basic ${asBase64}`;
    }

    public static async postRequest<T>(endpoint: string, init: RequestInit): Promise<T> {
        const response = await fetch(`${this.ZOOM_BASE_URL}${endpoint}`, {
            method: 'POST',
            ...init,
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Zoom API Error (${response.status}): ${errorMessage}`);
        }

        return response.json() as Promise<T>;
    }
}

type GetTokenResponse = { access_token: string; expires_in: number };
type RegistrantsResponse = { join_url: string };
type GetJoinUrlOptions = {
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
    meetingId: number;
};

class ZoomService {
    private static readonly REDIS_TOKEN_KEY = 'zoom:access_token';

    private async getToken(): Promise<GetTokenResponse> {
        const redisClient = await getRedisClient();

        // Try to get the token from Redis first
        const cachedToken = await redisClient.get(ZoomService.REDIS_TOKEN_KEY);
        if (cachedToken) {
            return JSON.parse(cachedToken);
        }

        const response = await ZoomAPI.postRequest<GetTokenResponse>('/oauth/token', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: ZoomAPI.getAuthBasicString(
                    env.ZOOM.CLIENT_ID,
                    env.ZOOM.CLIENT_SECRET,
                ),
            },
            body: new URLSearchParams({
                grant_type: 'account_credentials',
                account_id: env.ZOOM.ACCOUNT_ID,
            }),
        });

        // Cache the token in Redis with an expiration time slightly less than 'expires_in' to ensure it's valid
        await redisClient.setEx(
            ZoomService.REDIS_TOKEN_KEY,
            response.expires_in - 60,
            JSON.stringify(response),
        );

        return response;
    }

    public async getJoinUrl({ user, meetingId }: GetJoinUrlOptions): Promise<string> {
        const token = await this.getToken();
        if (!token || !token.access_token) {
            throw new Error('No Zoom access token');
        }

        const body = {
            first_name: user.firstName || 'Estudiante',
            last_name: user.lastName || 'BuenaOnda',
            email: user.email,
            language: 'es-ES',
        };

        const response = await ZoomAPI.postRequest<RegistrantsResponse>(
            `/v2/meetings/${meetingId}/registrants`,
            {
                headers: {
                    Authorization: `Bearer ${token.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            },
        );

        return response.join_url;
    }
}

export default ZoomService;
