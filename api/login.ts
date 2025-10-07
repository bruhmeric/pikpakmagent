import type { VercelRequest, VercelResponse } from '@vercel/node';
import { loginToPikPak } from './lib/pikpak-client.js';

async function verifyCaptcha(token: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.error('RECAPTCHA_SECRET_KEY is not set in environment variables.');
    throw new Error('CAPTCHA configuration is missing on the server.');
  }

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${secret}&response=${token}`,
  });

  const data: any = await response.json();
  return data.success;
}


export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password, captchaToken } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  if (!captchaToken) {
    return res.status(400).json({ message: 'CAPTCHA token is required.' });
  }

  try {
    const isCaptchaValid = await verifyCaptcha(captchaToken);
    if (!isCaptchaValid) {
      return res.status(400).json({ message: 'Invalid CAPTCHA. Please try again.' });
    }

    const token = await loginToPikPak(username, password, captchaToken);
    return res.status(200).json({ token });
  } catch (error) {
    console.error('PikPak Login Error:', error);
    const message = error instanceof Error ? error.message : 'Login failed.';
    // Customize error message for better user feedback
    const userFriendlyMessage = message.toLowerCase().includes('password') || message.toLowerCase().includes('credentials')
        ? 'Invalid credentials provided.'
        : 'Login failed.';
    return res.status(401).json({ message: userFriendlyMessage });
  }
}