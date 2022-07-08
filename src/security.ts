import bcrypt from 'bcrypt';
import { decode, sign, verify } from 'jsonwebtoken';
import { TokenData } from './interfaces/TokenData';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function validatePassword(password: string, hashed: string) {
  return await bcrypt.compare(password, hashed);
}

export function generateToken(data: TokenData): string {
  return sign({ id: data.id }, 'jwt');
}

export function isValidToken(token: string): boolean {
  try {
    verify(token, 'jwt');
    return true;
  } catch (e) {
    return false;
  }
}

export function extraDataFromToken(token: string): TokenData {
  return decode(token) as TokenData;
}