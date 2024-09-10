import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Layout from './admin-layout'; // Assuming Layout is in the components folder

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/is_admin`, { withCredentials: true });
                console.log('Admin check response:', response.data);

                if (response.data.isAdmin) {
                    setIsAdmin(true);
                    fetchCourses();
                } else {
                    router.push('/login');
                }
            } catch (err) {
                console.error('Error checking admin status:', err);
                if (err.response && err.response.status === 403) {
                    router.push('/login');
                } else {
                    setError("Failed to verify admin status.");
                }
            }
        };

        const fetchCourses = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/admin/courses`, { withCredentials: true });
                console.log('Fetch courses response:', response.data);

                if (response.data && Array.isArray(response.data)) {
                    setCourses(response.data);
                } else {
                    setError("Unexpected response format.");
                }
            } catch (err) {
                console.error("Error fetching courses:", err);

                if (err.response) {
                    if (err.response.status === 401) {
                        router.push('/login');
                    } else if (err.response.status === 403) {
                        setError("You do not have permission to access this data.");
                    } else {
                        setError("Failed to load courses. Please try again later.");
                    }
                } else {
                    setError("Failed to load courses. Please try again later.");
                }
            }
        };

        checkAdmin();
    }, [router]);

    const handleDeleteCourse = async (courseId) => {
        try {
            const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/delete_course/${courseId}`, { withCredentials: true });

            if (response.data.success) {
                setCourses(courses.filter(course => course.id !== courseId));
            } else {
                setError(response.data.message || "Failed to delete course.");
            }
        } catch (err) {
            console.error("Error deleting course:", err);
            setError("Failed to delete course. Please try again later.");
        }
    };

    const handleEditCourse = (courseId) => {
        router.push(`/admin/edit-course/${courseId}`);
    };

    if (error) {
        return <p style={{ color: "red" }}>{error}</p>;
    }

    if (!isAdmin) {
        return <p>Loading...</p>;
    }

    return (
        <Layout>
            <div style={{ padding: "20px" }}>
                <h1>Courses</h1>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>Course Name</th>
                            <th style={tableHeaderStyle}>Course Code</th>
                            <th style={tableHeaderStyle}>Description</th>
                            <th style={tableHeaderStyle}>Credit</th>
                            <th style={tableHeaderStyle}>Level</th>
                            <th style={tableHeaderStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.length > 0 ? (
                            courses.map((course) => (
                                <tr key={course.id} style={tableRowStyle}>
                                    <td style={tableCellStyle}>{course.course_name}</td>
                                    <td style={tableCellStyle}>{course.course_code}</td>
                                    <td style={tableCellStyle}>{course.course_description}</td>
                                    <td style={tableCellStyle}>{course.credit}</td>
                                    <td style={tableCellStyle}>{course.level}</td>
                                    <td style={tableCellStyle}>
                                        <button onClick={() => handleEditCourse(course.id)} style={buttonStyle}>Edit</button>
                                        <button onClick={() => handleDeleteCourse(course.id)} style={buttonStyle}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={tableCellStyle}>No courses found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <button onClick={() => router.push("/admin/add-course")} style={addButtonStyle}>Add New Course</button>
            </div>
        </Layout>
    );
}

const tableHeaderStyle = {
    padding: "10px",
    backgroundColor: "#f2f2f2",
    borderBottom: "2px solid #ddd",
    textAlign: "left",
};

const tableRowStyle = {
    borderBottom: "1px solid #ddd",
};

const tableCellStyle = {
    padding: "10px",
};

const buttonStyle = {
    marginRight: "10px",
    padding: "5px 10px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
};

const addButtonStyle = {
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
};
