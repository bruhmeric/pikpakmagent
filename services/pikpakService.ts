import { PikPakTask, Task } from '../types';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 504) {
      throw new Error('The request timed out. Please try again.');
    }
    if (response.status >= 500) {
      throw new Error(`Server error (${response.status}). Please check the deployment logs for details.`);
    }

    const errorData = await response.json().catch(() => null);
    if (errorData && errorData.message) {
      throw new Error(errorData.message);
    }
    
    throw new Error(`An unknown error occurred (HTTP ${response.status}).`);
  }
  return response.json();
};

export const login = async (credentials: { username: string; password: string; captchaToken: string; }): Promise<{ token: string }> => {
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