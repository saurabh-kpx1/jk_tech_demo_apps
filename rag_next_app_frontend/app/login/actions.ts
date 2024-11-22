'use server'

import { ResultCode } from '@/lib/utils'
import { cookies } from 'next/headers';
import dotenv from 'dotenv';

dotenv.config();

const NEST_APP_URL = process.env.NEST_APP_URL;

interface Result {
  type: string
  resultCode: ResultCode
}

interface User {
  id: string;
  name: string;
  password: string;
  salt: string;
}

export async function getUser(email: string): Promise<User | null> {
  // Simulate fetching user data from a database or external service
  return {
    id: 'user_id',
    name: email,
    password: 'hashed_password',
    salt: 'random_salt'
  }
}

export async function login(
  _prevState: Result | undefined,
  formData: FormData
): Promise<Result> {
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const response = await fetch(`${NEST_APP_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "username": email,
        "password": password
      })
    })

    if (response.ok) {
      const json = await response.json();
      console.log(json);
      if (json.message === 'Invalid password') {
        return {
          type: 'error',
          resultCode: ResultCode.InvalidPassword
        }
      }
      if (json.message === 'User not registered') {
        return {
          type: 'error',
          resultCode: ResultCode.UserNotRegistered
        }
      }
      const token = json.token;
      
      // Save the token, username, and password in cookies
      cookies().set('token', token);
      cookies().set('username', email);
      //cookies().set('password', password);

      return {
        type: 'success',
        resultCode: ResultCode.UserCreated
      }
    } else {
      const json = await response.json()
      if (json.error === 'User already exists') {
        return {
          type: 'error',
          resultCode: ResultCode.UserAlreadyExists
        }
      } else {
        return {
          type: 'error',
          resultCode: ResultCode.UnknownError
        }
      }
    }
  } catch (error) {
    return {
      type: 'error',
      resultCode: ResultCode.UnknownError
    }
  }
}
