import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'placement_ready_jwt_secret_key_2026',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  COLLEGE_DOMAIN: process.env.COLLEGE_DOMAIN || 'sece.ac.in',
};
