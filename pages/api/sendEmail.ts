// pages/api/sendEmail.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await axios.post('https://hooks.zapier.com/hooks/catch/15658686/3h8iz7e/', {
      email: req.body.email,
      subject: req.body.subject,
      // Additional data as per Zapier's requirements
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
}
