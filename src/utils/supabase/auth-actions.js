'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData) {
  const supabase = await createClient()

  const signUpData = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  // Try to sign up the user - Supabase auth.signUp will tell us if user already exists
  const { data , error } = await supabase.auth.signUp(signUpData)
  
  if (error) {
    return error
  }

  // User email already exists
  if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
    return { error: { message: "This email is already registered. Please log in instead." } }
  }

  return { message: "Signup successful, confirmation email sent." }
}

export async function resetPassword(formData) {
  const supabase = await createClient()
  
  const email = formData.get('email')
  
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  
  if (error) {
    return { error }
  }
  
  return { success: true }
}

export async function updatePassword(formData) {
  const supabase = await createClient()
  
  const password = formData.get('password')
  
  const { error } = await supabase.auth.updateUser({
    password,
  })
  
  if (error) {
    return { error }
  }
  
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signInWithOAuth(provider) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/callback`,
    },
  })

  if (error) {
    redirect('/error')
  }

  return { url: data.url }
}