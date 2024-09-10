import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from './admin-layout'; // Assuming Layout is in the components folder

export default function AddCourse() {
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [credit, setCredit] = useState('');
    const [level, setLevel] = useState('');
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

    const addCourse = async () => {
        try {
            await axios.post('http://localhost:3001/api/courses', {
                course_name: courseName,
                course_code: courseCode,
                course_description: courseDescription,
                credit,
                level
            }, {
                withCredentials: true // Send cookies with the request
            });

            // Redirect to home page after successful course addition
            router.push('/admin/search');
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    // Redirect to login page if unauthorized
                    router.push('/login');
                } else if (error.response.status === 403) {
                    // Show a forbidden message
                    alert('You do not have permission to add courses.');
                } else {
                    // Handle other types of errors
                    alert('An error occurred while adding the course.');
                }
            } else {
                console.error('Error:', error);
                alert('An error occurred while adding the course.');
            }
        }
    };

    if (!isAdmin) {
        return <p>Loading...</p>;
    }

    return (
        <Layout>
            <div style={{ padding: "20px" }}>
                <h1>Add Course</h1>
                <form onSubmit={(e) => { e.preventDefault(); addCourse(); }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                        <label>Course Name</label>
                        <input
                            type="text"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            placeholder="Course Name"
                            required
                            style={{ width: "100%" }}
                        />
                    </div>
                    <div>
                        <label>Course Code</label>
                        <input
                            type="text"
                            value={courseCode}
                            onChange={(e) => setCourseCode(e.target.value)}
                            placeholder="Course Code"
                            required
                            style={{ width: "100%" }}
                        />
                    </div>
                    <div>
                        <label>Credit</label>
                        <input
                            type="text"
                            value={credit}
                            onChange={(e) => setCredit(e.target.value)}
                            placeholder="Credit"
                            required
                            style={{ width: "100%" }}
                        />
                    </div>
                    <div>
                        <label>Level</label>
                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            required
                            style={{ width: "100%", padding: "2px", borderRadius: "4px", border: "1px solid #ddd" }}
                        >
                            <option value="">Select Level</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </select>
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                        <label>Course Description</label>
                        <textarea
                            value={courseDescription}
                            onChange={(e) => setCourseDescription(e.target.value)}
                            placeholder="Course Description"
                            required
                            style={{ width: "100%", height: "100px", padding: "10px", borderRadius: "4px", border: "1px solid #ddd", boxSizing: "border-box" }}
                        />
                    </div>
                    <div style={{ gridColumn: "span 2", textAlign: "center" }}>
                        <button type="submit" style={{ backgroundColor: "#007bff", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}>
                            Add Course
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
