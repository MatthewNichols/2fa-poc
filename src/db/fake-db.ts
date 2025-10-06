// A conveniencse fake database for the POC. 
// YES I KNOW THIS IS NOT SUITABLE FOR PRODUCTION, 
// or anything other than a POC really

import * as fs from 'fs/promises';
import * as path from 'path';
import { Totp } from 'time2fa';

export interface IUser {
  /** Must be unique */
  username: string;
  password: string;
  admin?: boolean;
  /** Has 2FA been setup? Not stored in DB */
  twoFAuthRequired?: boolean;
  /** Has 2FA been confirmed with at least one successful passcode roundtrip */
  twoFAuthConfigConfirmed: boolean;
  // TOTP properties
  issuer?: string;
  config?: {
    algo: string;
    digits: number;
    period: number;
    secretSize: number;
  };
  secret?: string;
  url?: string;
}

const filePath = path.join(__dirname, '../../_data/users.json');
let usersLoaded = false;
const users: IUser[] = [];

export async function loadUsers() {
  // read users from ../data/users.json into users array
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    users.length = 0; // Clear existing users
    users.push(...data.users);
    usersLoaded = true;
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

export async function saveUser(user: IUser) {
  if (!usersLoaded) {
    throw new Error('Users not loaded');
  }

  if (user.password === undefined || user.username === undefined) {
    throw new Error('Username and Password is required');
  }

  if (user.admin === undefined) {
    user.admin = false;
  }

  if (user.twoFAuthConfigConfirmed === undefined) {
    user.twoFAuthConfigConfirmed = false;
  }

  const existingUser = users.find((u) => u.username === user.username);
  if (existingUser && user.password) {
    existingUser.password = user.password;
    existingUser.issuer = user.issuer;
    existingUser.config = user.config;
    existingUser.secret = user.secret;
    existingUser.url = user.url;
  } else {
    users.push(user);
  }

  // write users to ../data/users.json
  await fs.writeFile(filePath, JSON.stringify({ users }, null, 2));
}

function addUserCalculatedFields(user: IUser | undefined): IUser | undefined {
  if (!user) {
    return undefined;
  }

  return {
    ...user,
    // Calculate twoFAuthRequired (i.e.: 2FA was setup and confirmed for this user)
    twoFAuthRequired: user?.secret !== undefined && user.twoFAuthConfigConfirmed,
  };
}

export function getUser(username: string): IUser | undefined {
  if (!usersLoaded) {
    throw new Error('Users not loaded');
  }

  const userFromDB = users.find((user) => user.username === username);
  if (!userFromDB) {
    return undefined;
  }

  return addUserCalculatedFields(userFromDB);
}

export function validateUserPassword(username: string, password: string): IUser | undefined {
  if (!usersLoaded) {
    throw new Error('Users not loaded');
  }

  return addUserCalculatedFields(users.find(
    (user) => user.username === username && user.password === password
  ));
}

export function validateUser2FA(username: string, passcode: string): boolean {
  if (!usersLoaded) {
    throw new Error('Users not loaded');
  }

  const user = users.find((u) => u.username === username);
  if (!user || !user.secret) {
    return false;
  }
  return Totp.validate({ secret: user.secret, passcode });
}
