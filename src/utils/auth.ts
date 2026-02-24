// 1. App.tsx se API_URL import kiya taaki Vercel ke variables use ho sakein
import { API_URL } from '../App'; 

/**
 * SIGNUP FUNCTION
 * Naya user register karne ke liye
 */
export const handleSignup = async (userData: { username?: string; fullName?: string; email: string; password: string }) => {
    try {
        console.log("Connecting to:", `${API_URL}/signup`);

        const response = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        return { 
            success: response.ok, 
            message: data.message || "Signup successful" 
        };
    } catch (error) {
        console.error("Signup Error:", error);
        return { 
            success: false, 
            message: "Server se connection nahi ho paya. Railway backend check karein!" 
        };
    }
};

/**
 * LOGIN FUNCTION
 * User login handle karne ke liye
 */
export const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
        console.log("Attempting Login at:", `${API_URL}/login`);

        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();

        if (response.ok) {
            // Token aur user details save karna
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            return { 
                success: true, 
                user: data.user 
            };
        } else {
            return { 
                success: false, 
                message: data.message || "Email ya password galat hai" 
            };
        }
    } catch (error) {
        console.error("Login Error:", error);
        return { 
            success: false, 
            message: "Server is down. Vercel Settings mein Variable check karein!" 
        };
    }
};

/**
 * LOGOUT FUNCTION
 */
export const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
};