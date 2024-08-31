import { Injectable } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class PasswordService {
  /**
   * Hashes the given password using bcrypt with a salt round of 10.
   * @param password - The plain text password to be hashed.
   * @returns A promise that resolves to the hashed password.
   */
  async encode(password: string): Promise<string> {
    return bcryptjs.hash(password, 10);
  }

  /**
   * Compares a plain text password with a hashed password to check if they match.
   * @param password - The plain text password to compare.
   * @param hashedPassword - The hashed password to compare against.
   * @returns A promise that resolves to a boolean indicating whether the passwords match.
   */
  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcryptjs.compare(password, hashedPassword);
  }
}
