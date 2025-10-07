// This file runs on the server only.

const API_BASE = 'https://api-drive.mypikpak.com/drive/v1';
const AUTH_BASE = 'https://user.mypikpak.com/v1';

// These values are typically constant for a specific client version.
// The previous client_id/secret were likely revoked. This is a more current one.
const CLIENT_CONSTANTS = {
  CLIENT_ID: 'TUFEcE1EZ3lNVGsyT1RBME1nPT06bTBwMG5zMnF2M2R0c2g1ZDE3ZTAxZDFpbm8=',
};

async function pikpakFetch(url: string, options: RequestInit = {}) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Content-Type': 'application/json',
        ...options.headers,
    };

    try {
        const response = await fetch(url, { ...options, headers });
        const responseText = await response.text();

        if (!response.ok) {
            try {
                const errorData = JSON.parse(responseText);
                throw new Error(errorData.error_description || `PikPak API Error: ${response.status}`);
            } catch (e) {
                throw new Error(`Request failed with status ${response.status}. Response: ${responseText.slice(0, 150)}`);
            }
        }
        
        // Handle successful but empty responses to prevent JSON parsing errors
        if (!responseText) {
            return {};
        }

        return JSON.parse(responseText);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`PikPak API request to ${url} failed:`, error.message);
            throw new Error(`Failed to communicate with PikPak API: ${error.message}`);
        }
        throw new Error('An unexpected error occurred while communicating with the PikPak API.');
    }
}

export async function loginToPikPak(username: string, password: string, captchaToken: string) {
    const url = `${AUTH_BASE}/auth/signin`;
    const body = {
        captcha_token: captchaToken,
        client_id: CLIENT_CONSTANTS.CLIENT_ID,
        username,
        password,
    };

    const data: any = await pikpakFetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
    });

    if (!data.access_token) {
        throw new Error('Login response from PikPak was invalid or did not contain a token.');
    }
    return data.access_token;
}

export async function getTaskList(token: string) {
    const url = `${API_BASE}/tasks?type=offline&limit=100`;
    const data: any = await pikpakFetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.tasks || [];
}

export async function createTask(token: string, magnetLink: string) {
    const url = `${API_BASE}/offline`;
    const body = {
        kind: 'drive#offlineTask',
        name: 'magnet',
        params: { url: magnetLink },
    };
    const data: any = await pikpakFetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    if (!data.task || !data.task.id) {
        throw new Error('Create task response from PikPak was invalid.');
    }
    return data.task;
}

export async function getFileDownloadUrl(token: string, fileId: string) {
    const url = `${API_BASE}/files/${fileId}?with_audit=true`;
    const data: any = await pikpakFetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!data.web_content_link) {
        throw new Error('Get file link response from PikPak was invalid.');
    }
    return data.web_content_link;
}