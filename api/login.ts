import type { VercelRequest, VercelResponse } from '@vercel/node';
import { loginToPikPak } from './lib/pikpak-client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const token = await loginToPikPak(username, password);
    return res.status(200).json({ token });
  } catch (error) {
    console.error('PikPak Login Error:', error);
    const message = error instanceof Error ? error.message : 'Login failed.';
    // Customize error message for better user feedback
    const userFriendlyMessage = message.includes('password') ? 'Invalid credentials provided.' : 'Login failed.';
    return res.status(401).json({ message: userFriendlyMessage });
  }
}
