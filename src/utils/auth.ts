// --- CONFIGURATION ---
// Backend port 5000 par hai aur frontend 5173 par, isliye 5000 use kiya hai
const API_URL = "http://localhost:5000/api";

/**
 * SIGNUP FUNCTION
 * User ka account banane ke liye
 */
export const handleSignup = async (userData: { username?: string; fullName?: string; email: string; password: string }) => {
    try {
        // Debugging: Console mein check karne ke liye ki data kya ja raha hai
        console.log("Attempting signup with:", userData);

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
            message: "Server se connection nahi ho paya. Backend check karein!" 
        };
    }
};

/**
 * LOGIN FUNCTION
 */
export const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
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
            message: "Server is down. Check backend port 5000!" 
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