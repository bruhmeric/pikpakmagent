// This file runs on the server only.

const API_BASE = 'https://api-drive.mypikpak.com/drive/v1';
const AUTH_BASE = 'https://user.mypikpak.com/v1';

// These values are typically constant for a specific client version.
// In a real-world scenario, these should be managed as environment variables.
const CLIENT_CONSTANTS = {
  CLIENT_ID: 'Y2VjYjM5N2QtN2Q5My00ZWNmLTkyNTMtYjcwMTEzYTAwYjI3',
  CLIENT_SECRET: 'MDM5MzU3ZmQtYjg4OS00MWE5LTg1ZDMtOTFhZTQ2ZGI3MzA5',
  CAPTCHA_TOKEN: '//1',
};

async function pikpakFetch(url: string, options: RequestInit = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error_description: 'Request failed with status ' + response.status }));
        throw new Error(errorData.error_description || 'An unknown PikPak API error occurred');
    }
    return response.json();
}

export async function loginToPikPak(username: string, password: string) {
    const url = `${AUTH_BASE}/auth/signin`;
    const body = {
        captcha_token: CLIENT_CONSTANTS.CAPTCHA_TOKEN,
        client_id: CLIENT_CONSTANTS.CLIENT_ID,
        client_secret: CLIENT_CONSTANTS.CLIENT_SECRET,
        username,
        password,
    };

    const data = await pikpakFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    return data.access_token;
}

export async function getTaskList(token: string) {
    const url = `${API_BASE}/tasks?type=offline&limit=100`;
    const data = await pikpakFetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.tasks || [];
}

export async function createTask(token: string, magnetLink: string) {
    const url = `${API_BASE}/offline`;
    const body = {
        kind: 'drive#offlineTask',
        name: 'magnet', // This seems to be a required static value
        params: { url: magnetLink },
    };
    const data = await pikpakFetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });
    return data.task;
}

export async function getFileDownloadUrl(token: string, fileId: string) {
    const url = `${API_BASE}/files/${fileId}?with_audit=true`;
    const data = await pikpakFetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.web_content_link;
}
