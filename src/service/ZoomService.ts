import { env } from '@/env';
import { getRedisClient } from '@/redis-client';

class ZoomAPI {
    private static readonly ZOOM_BASE_URL = 'https://zoom.us';

    public static getAuthHeader(clientId: string, clientSecret: string): HeadersInit {
        const credentials = `${clientId}:${clientSecret}`;
        const encodedCredentials = Buffer.from(credentials).toString('base64');
        return {
            Authorization: `Basic ${encodedCredentials}`,
            'Content-Type': 'application/json',
        };
    }

    public static async postRequest<T>(
        endpoint: string,
        headers: HeadersInit,
        body: Record<string, unknown>,
    ): Promise<T> {
        const response = await fetch(`${this.ZOOM_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
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
    private static readonly TOKEN_KEY = 'zoom:access_token';

    private async getToken(): Promise<GetTokenResponse> {
        const redisClient = await getRedisClient();

        // Try to get the token from Redis first
        const cachedToken = await redisClient.get(ZoomService.TOKEN_KEY);
        if (cachedToken) {
            return JSON.parse(cachedToken);
        }

        const headers = ZoomAPI.getAuthHeader(env.ZOOM.CLIENT_ID, env.ZOOM.CLIENT_SECRET);
        const body = {
            grant_type: 'account_credentials',
            account_id: env.ZOOM.ACCOUNT_ID,
        };

        const response = await ZoomAPI.postRequest<GetTokenResponse>(
            '/oauth/token',
            headers,
            body,
        );

        // Cache the token in Redis with an expiration time slightly less than 'expires_in' to ensure it's valid
        await redisClient.setEx(
            ZoomService.TOKEN_KEY,
            response.expires_in - 60,
            JSON.stringify(response),
        );

        return response;
    }

    public async getJoinUrl({ user, meetingId }: GetJoinUrlOptions): Promise<string> {
        const token = await this.getToken();
        const headers = {
            Authorization: `Bearer ${token.access_token}`,
            'Content-Type': 'application/json',
        };

        const body = {
            first_name: user.firstName || 'Estudiante',
            last_name: user.lastName || 'BuenaOnda',
            email: user.email,
            language: 'es-ES',
        };

        const response = await ZoomAPI.postRequest<RegistrantsResponse>(
            `/v2/meetings/${meetingId}/registrants`,
            headers,
            body,
        );

        return response.join_url;
    }
}

export default ZoomService;
