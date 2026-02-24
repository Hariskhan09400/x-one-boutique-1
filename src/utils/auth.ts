import { API_URL } from '../App'; 

/**
 * SIGNUP FUNCTION
 * Route: /api/signup (Server.js ke mutabik)
 */
export const handleSignup = async (userData: { username?: string; fullName?: string; email: string; password: string }) => {
    try {
        // Aapke server.js mein rasta '/api/signup' hai
        const response = await fetch(`${API_URL}/api/signup`, {
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
            message: "Server se connection nahi ho paya!" 
        };
    }
};

/**
 * LOGIN FUNCTION
 * Route: /api/login (Server.js ke mutabik)
 */
export const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
        // Aapke server.js mein rasta '/api/login' hai
        const response = await fetch(`${API_URL}/api/login`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();

        if (response.ok) {
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
            message: "Server Down! API URL check karein." 
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