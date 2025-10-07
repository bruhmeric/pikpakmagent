import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFileDownloadUrl } from '../../lib/pikpak-client';

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
  
  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'File ID is required.' });
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const downloadUrl = await getFileDownloadUrl(token, id);
    return res.status(200).json({ downloadUrl });
  } catch (error) {
    console.error('PikPak Get Link Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get download link.';
    return res.status(500).json({ message });
  }
}