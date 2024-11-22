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

export async function signup(
  _prevState: Result | undefined,
  formData: FormData
) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const response = await fetch(`${NEST_APP_URL}/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "username": email,
        "email": email,
        "password": password
      })
    })
    console.log('this is',response)

    if (response.ok) {
      const json = await response.json();
      if (json.message === 'User already exists') {
        return {
          type: 'error',
          resultCode: ResultCode.UserAlreadyExists
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
