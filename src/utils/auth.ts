import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oaonaiocrkujucaepefk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hb25haW9jcmt1anVjYWVwZWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTEwNDcsImV4cCI6MjA4NzQyNzA0N30.FrvBV8S_ztH_bJr9O_or1DLRjZF6GR2or6UkmrTyXTE';
export const supabase = createClient(supabaseUrl, supabaseKey);

// --- 1. SIGNUP LOGIC (Auth + Profile Table) ---
export const handleSignup = async ({ username, email, password }: any) => {
  try {
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: username },
      },
    });

    if (authError) throw authError;

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: data.user.id, 
            full_name: username, 
            email: email 
          }
        ]);
      
      if (profileError) {
        console.error("Profile Link Error:", profileError.message);
      }
    }

    return { success: true, user: data.user };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// --- 2. LOGIN LOGIC ---
export const handleLogin = async ({ email, password }: any) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { 
      success: true, 
      user: { 
        username: data.user.user_metadata.full_name, 
        email: data.user.email,
        id: data.user.id 
      } 
    };
  } catch (error: any) {
    return { success: false, message: "The login information you entered is incorrect." };
  }
};

// --- 3. FORGOT PASSWORD (Reset Link bhejega) ---
export const handleForgotPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Jahan user link click karne ke baad redirect hoga
      redirectTo: `${window.location.origin}/update-password`, 
    });
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// --- 4. UPDATE PASSWORD (Naya password set karega) ---
export const handleUpdatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};