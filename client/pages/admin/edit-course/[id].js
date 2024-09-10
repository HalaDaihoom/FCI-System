"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
 import Layout from '../admin-layout'; // Assuming Layout is in the components folder

export default function EditCourse() {
    const [course, setCourse] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [updatedData, setUpdatedData] = useState({
        course_name: "",
        course_code: "",
        course_description: "",
        credit: "",
        level: "",
    });
    const [isAdmin, setIsAdmin] = useState(false);

    const router = useRouter();
    const { id } = useParams() || {}; // Handle potential null value

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
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    router.push('/login');
                } else {
                    console.error('Error checking admin status:', error);
                }
            }
        };

        checkAdmin();
    }, [router]);

    useEffect(() => {
        if (id && isAdmin) {
            const fetchCourseDetails = async () => {
                try {
                    const response = await axios.get(`http://localhost:3001/api/course/${id}`, {
                        withCredentials: true
                    });
                    setCourse(response.data);
                    setUpdatedData({
                        course_name: response.data.course_name,
                        course_code: response.data.course_code,
                        course_description: response.data.course_description,
                        credit: response.data.credit,
                        level: response.data.level,
                    });
                    setLoading(false);
                } catch (err) {
                    console.error("Error fetching course details:", err);
                    setError("Failed to load course details.");
                    setLoading(false);
                }
            };

            fetchCourseDetails();
        } else if (!id) {
            // Redirect if id is not available
            router.push('/login');
        }
    }, [id, isAdmin]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:3001/api/course/${id}`, updatedData, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            if (response.status === 200) {
                router.push("/admin/search"); // Redirect to search page
            } else {
                setError("Error updating course");
            }
        } catch (err) {
            console.error("Error updating course:", err);
            setError("Failed to update course.");
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!isAdmin) {
        return <p>Redirecting...</p>; // Provide a visual cue while redirecting
    }

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useRouter } from "next/router";
// import Layout from '../admin-layout'; // Assuming Layout is in the components folder

// export default function EditCourse() {
//     const [course, setCourse] = useState(null);
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(true);
//     const [updatedData, setUpdatedData] = useState({
//         course_name: "",
//         course_code: "",
//         course_description: "",
//         credit: "",
//         level: "",
//     });
//     const [isAdmin, setIsAdmin] = useState(false);
//     const router = useRouter();
//     const { id } = router.query;

//     useEffect(() => {
//         const checkAdmin = async () => {
//             try {
//                 const response = await axios.get('http://localhost:3001/api/is_admin', {
//                     withCredentials: true
//                 });
//                 if (response.data.isAdmin) {
//                     setIsAdmin(true);
//                 } else {
//                     router.push('/login');
//                 }
//             } catch (error) {
//                 if (error.response && error.response.status === 403) {
//                     router.push('/login');
//                 } else {
//                     console.error('Error checking admin status:', error);
//                 }
//             }
//         };

//         checkAdmin();
//     }, [router]);

//     useEffect(() => {
//         if (id && isAdmin) {
//             console.log('Course ID:', id);
//             const fetchCourseDetails = async () => {
//                 try {
//                     const response = await axios.get(`http://localhost:3001/api/course/${id}`, {
//                         withCredentials: true
//                     });
//                     setCourse(response.data);
//                     setUpdatedData({
//                         course_name: response.data.course_name,
//                         course_code: response.data.course_code,
//                         course_description: response.data.course_description,
//                         credit: response.data.credit,
//                         level: response.data.level,
//                     });
//                     setLoading(false);
//                 } catch (err) {
//                     console.error("Error fetching course details:", err);
//                     setError("Failed to load course details.");
//                     setLoading(false);
//                 }
//             };
    
//             fetchCourseDetails();
//         } else if (!id) {
//             router.push('/login');
//         }
//     }, [id, isAdmin]);
    

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setUpdatedData((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleFormSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await axios.put(`http://localhost:3001/admin/edit-course/${id}`, updatedData, {
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 withCredentials: true,
//             });

//             if (response.status === 200) {
//                 router.push("/admin/search"); // Redirect back to courses list
//             } else {
//                 setError("Error updating course");
//             }
//         } catch (err) {
//             console.error("Error updating course:", err);
//             setError("Failed to update course.");
//         }
//     };

//     if (loading) {
//         return <p>Loading...</p>;
//     }

    return (
        <Layout>
            <div style={{ padding: "20px" }}>
                <h1>Edit Course</h1>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <form onSubmit={handleFormSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                        <label>Course Name</label>
                        <input
                            type="text"
                            name="course_name"
                            value={updatedData.course_name}
                            onChange={handleInputChange}
                            required
                            style={{ width: "100%" }}
                        />
                    </div>
                    <div>
                        <label>Course Code</label>
                        <input
                            type="text"
                            name="course_code"
                            value={updatedData.course_code}
                            onChange={handleInputChange}
                            required
                            style={{ width: "100%" }}
                        />
                    </div>
                    <div>
                        <label>Credit</label>
                        <input
                            type="text"
                            name="credit"
                            value={updatedData.credit}
                            onChange={handleInputChange}
                            style={{ width: "100%" }}
                        />
                    </div>
                    <div>
                        <label>Level</label>
                        <input
                            type="text"
                            name="level"
                            value={updatedData.level}
                            onChange={handleInputChange}
                            style={{ width: "100%" }}
                        />
                    </div>
                    <div>
                        <label>Course Description</label>
                        <textarea
                            name="course_description"
                            value={updatedData.course_description}
                            onChange={handleInputChange}
                            required
                            style={{ width: "100%", height: "100px", resize: "vertical" }}
                        />
                    </div>
                    <div style={{ gridColumn: "span 2", textAlign: "center" }}>
                        <button type="submit" style={{ backgroundColor: "#007bff", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "5px" }}>
                            Update Course
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
