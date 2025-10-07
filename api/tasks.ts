import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTaskList, createTask } from './lib/pikpak-client.js';

const getToken = (authHeader?: string) => {
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
        return parts[1];
    }
    return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = getToken(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  try {
    if (req.method === 'GET') {
      const tasks = await getTaskList(token);
      return res.status(200).json({ tasks });
    }

    if (req.method === 'POST') {
      const { magnetLink } = req.body;
      if (!magnetLink || !magnetLink.startsWith('magnet:?')) {
        return res.status(400).json({ message: 'Invalid magnet link provided.' });
      }
      const task = await createTask(token, magnetLink);
      return res.status(201).json(task);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('PikPak Task Error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred with tasks.';
    return res.status(500).json({ message });
  }
}