"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Layout from './admin-layout'; // Adjust the path if necessary

export default function AddStudent() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone_num: '',
        email: '',
        password: '',
        gender: 'Male',  // Default to Male
        level: '',
        image: null
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/is_admin', {
                    withCredentials: true
                });
                if (response.data.isAdmin) {
                    setIsAdmin(true);
                } else {
                    router.push('/login');
                }
            } catch (err) {
                if (err.response && err.response.status === 403) {
                    router.push('/login');
                } else {
                    console.error('Error checking admin status:', err);
                }
            }
        };

        checkAdmin();
    }, [router]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // const handleFileChange = (e) => {
    //     setFormData(prevData => ({
    //         ...prevData,
    //         image: e.target.files[0]
    //     }));
    // };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        
        // File type validation
        if (file && !file.type.startsWith('image/')) {
            setError('Please upload a valid image file.');
            setFormData(prevData => ({
                ...prevData,
                image: null
            }));
            return;
        }

        setError(''); // Clear error if file is valid
        setFormData(prevData => ({
            ...prevData,
            image: file
        }));
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();

    //     const formDataObj = new FormData();
    //     for (const key in formData) {
    //         formDataObj.append(key, formData[key]);
    //     }

    //     try {
    //         const response = await axios.post('http://localhost:3001/add-student', formDataObj, {
    //             headers: {
    //                 "Content-Type": "multipart/form-data"
    //             },
    //             withCredentials: true // Send cookies with the request
    //         });

    //         if (response.data.success) {
    //             setSuccess("Student added successfully.");
    //             setError("");
    //             setFormData({
    //                 first_name: '',
    //                 last_name: '',
    //                 phone_num: '',
    //                 email: '',
    //                 password: '',
    //                 gender: 'Male',
    //                 level: '',
    //                 image: null
    //             });
    //         } else {
    //             setError(response.data.message || "Failed to add student.");
    //             setSuccess("");
    //         }
    //     } catch (err) {
    //         console.error("Error adding student:", err);
    //         if (err.response) {
    //             if (err.response.status === 401) {
    //                 router.push('/login');
    //             } else if (err.response.status === 403) {
    //                 setError("You do not have permission to add students.");
    //             } else {
    //                 setError("Failed to add student. Please try again later.");
    //             }
    //         } else {
    //             setError("Failed to add student. Please try again later.");
    //         }
    //         setSuccess("");
    //     }
    // };

    // if (!isAdmin) {
    //     return <p>Loading...</p>;
    // }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.image) {
            setError('Please upload an image.');
            return;
        }

        const formDataObj = new FormData();
        for (const key in formData) {
            if (key !== 'image') { // Ensure image file is appended separately
                formDataObj.append(key, formData[key]);
            } else if (formData[key]) {
                formDataObj.append(key, formData[key]);
            }
        }

        try {
            const response = await axios.post('http://localhost:3001/add-student', formDataObj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                withCredentials: true // Send cookies with the request
            });

            if (response.data.success) {
                setSuccess("Student added successfully.");
                setError("");
                setFormData({
                    first_name: '',
                    last_name: '',
                    phone_num: '',
                    email: '',
                    password: '',
                    gender: 'Male',
                    level: '',
                    image: null
                });

                // Redirect to the students page after successful addition
                setTimeout(() => {
                    router.push('/admin/students');
                }, 1000); // Delay redirection to allow success message to be visible
            } else {
                setError(response.data.message || "Failed to add student.");
                setSuccess("");
            }
        } catch (err) {
            console.error("Error adding student:", err);
            if (err.response) {
                if (err.response.status === 401) {
                    router.push('/login');
                } else if (err.response.status === 403) {
                    setError("You do not have permission to add students.");
                } else {
                    setError("Failed to add student. Please try again later.");
                }
            } else {
                setError("Failed to add student. Please try again later.");
            }
            setSuccess("");
        }
    };

    if (!isAdmin) {
        return <p>Loading...</p>;
    }
    return (
        <Layout>
            <div style={{ padding: "20px" }}>
                <h1>Add Student</h1>
                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}
                <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                        <label>First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            required
                            style={{ width: "100%" }}
                        />
                    </div>
                    <div>
                        <label>Last Name</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            required
                            style={{ width: "100%" }}
                        />
                    </div>
                    <div>
                        <label>Phone Number</label>
                        <input
                            type="text"
                            name="phone_num"
                            value={formData.phone_num}
                            onChange={handleInputChange}
                            required
                            style={{ width: "100%" }}
                        />
                    </div>
                    <div>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            style={{ width: "100%" }}
                        />
                    </div>
                    <div>
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            style={{ width: "100%" }}
                        />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div style={{ width: "48%" }}>
                            <label>Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                style={{ width: "100%" }}
                                required
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div style={{ width: "48%" }}>
                            <label>Level</label>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleInputChange}
                                style={{ width: "100%" }}
                                required
                            >
                                <option value="">Select Level</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>
                    </div>
                    <div className="file-input-container">
                        <input type="file" name="image" onChange={handleFileChange} />
                        {error && <p className="file-input-error">{error}</p>}
                    </div>
                    {/* <div>
                        <label>Profile Image</label>
                        <input
                            type="file"
                            name="image"
                            onChange={handleFileChange}
                            style={{ width: "100%" }}
                        />
                    </div> */}
                    <div style={{ gridColumn: "span 2", textAlign: "center" }}>
                        <button type="submit" style={{ backgroundColor: "#007bff", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "5px" }}>
                            Add Student
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
