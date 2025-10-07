import { PikPakTask, Task } from '../types';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const login = async (credentials: { username: string; password: string }): Promise<{ token: string }> => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
};

export const getTasks = async (token: string): Promise<{ tasks: PikPakTask[] }> => {
  const response = await fetch('/api/tasks', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};


export const submitMagnetLink = async (magnetLink: string, token: string): Promise<PikPakTask> => {
    const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ magnetLink }),
    });
    return handleResponse(response);
};


export const getDownloadLink = async (taskId: string, token: string): Promise<{ downloadUrl: string }> => {
  const response = await fetch(`/api/tasks/${taskId}/link`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};
