import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
                email,
                password,
            }, {
                withCredentials: true // Ensure cookies are sent with the request
            });

            if (response.data && response.data.success) {
                if (response.data.role === 'student') {
                    router.push("/student/home"); // Redirect to the profile page
                } else if (response.data.role === 'admin') {
                    router.push("/admin/admin-profile"); // Redirect to admin profile page
                }
            } else {
                setError(response.data?.message || "Login failed. Please check your credentials.");
            }
        } catch (err) {
            console.error("Login error:", err.response ? err.response.data : err.message);
            setError("Login failed. Please try again later.");
        }
    };

    return (
        <div>
            <style jsx global>{`
                body {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
            `}</style>
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                backgroundImage: "url('/5940678393530008176.jpg')", // Add your background image here
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div
                style={{
                    padding: "20px",
                    borderRadius: "16px",
                    backgroundColor: "rgba(255, 255, 255, 0.1)", // Semi-transparent background
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.6)", // Softer shadow
                    backdropFilter: "blur(10px)", // Glassy blur effect
                    WebkitBackdropFilter: "blur(10px)", // For Safari support
                    border: "1px solid rgba(255, 255, 255, 0.3)", // Border for the glassy effect
                    width: "450px",
                }}
            >
                <h1 style={{ textAlign: "center", color: "black",fontWeight:"bold",fontSize:"25px"}}>Login</h1>
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column" }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            padding: "10px",
                            margin: "10px 0",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            backdropFilter: "blur(5px)", // Slight blur for input fields
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            padding: "10px",
                            margin: "10px 0",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            backdropFilter: "blur(5px)", // Slight blur for input fields
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: "10px",
                            backgroundColor: "#000c19",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        Login
                    </button>
                    {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
                </form>
            </div>
        </div>
        </div>
    );
}
