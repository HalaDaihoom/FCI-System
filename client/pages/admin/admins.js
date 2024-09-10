
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Layout from './admin-layout'; // Assuming Layout is in the components folder

export default function Students() {
    const [students, setStudents] = useState([]);
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
                    fetchStudents();
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

        const fetchStudents = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/admin/admins`, { withCredentials: true });
                console.log('Fetch students response:', response.data);

                if (response.data && Array.isArray(response.data)) {
                    setStudents(response.data);
                } else {
                    setError("Unexpected response format.");
                }
            } catch (err) {
                console.error("Error fetching students:", err);

                if (err.response) {
                    if (err.response.status === 401) {
                        router.push('/login');
                    } else if (err.response.status === 403) {
                        setError("You do not have permission to access this data.");
                    } else {
                        setError("Failed to load students. Please try again later.");
                    }
                } else {
                    setError("Failed to load students. Please try again later.");
                }
            }
        };

        checkAdmin();
    }, [router]);

    const handleDeleteStudent = async (adminId) => {
        try {
            const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/delete-admin/${adminId}`, { withCredentials: true });

            if (response.data.success) {
                setStudents(students.filter(admin => admin.user_id !== adminId));
            } else {
                setError(response.data.message || "Failed to delete student.");
            }
        } catch (err) {
            console.error("Error deleting student:", err);
            setError("Failed to delete student. Please try again later.");
        }
    };

    const handleEditStudent = (adminId) => {
        router.push(`/admin/edit-admin/${adminId}`);
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
                <h1>Admins</h1>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>First Name</th>
                            <th style={tableHeaderStyle}>Last Name</th>
                            <th style={tableHeaderStyle}>Email</th>
                            <th style={tableHeaderStyle}>Phone Number</th>
                            <th style={tableHeaderStyle}>Gender</th>
                            <th style={tableHeaderStyle}>Image</th>
                            
                            <th style={tableHeaderStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? (
                            students.map((student) => (
                                <tr key={student.user_id} style={tableRowStyle}>
                                    <td style={tableCellStyle}>{student.first_name}</td>
                                    <td style={tableCellStyle}>{student.last_name}</td>
                                    <td style={tableCellStyle}>{student.email}</td>
                                    <td style={tableCellStyle}>{student.phone_num}</td>
                                    <td style={tableCellStyle}>{student.gender}</td>
                                    <td style={tableCellStyle}>
                                        {student.image ? (
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${student.image}`}
                                                alt="Profile"
                                                width="50"
                                            />
                                        ) : (
                                            "No Image"
                                        )}
                                    </td>
                                    
                                    <td style={tableCellStyle}>
                                        <button onClick={() => handleEditStudent(student.user_id)} style={buttonStyle}>Edit</button>
                                        <button onClick={() => handleDeleteStudent(student.user_id)} style={buttonStyle}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" style={tableCellStyle}>No students found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <button onClick={() => router.push("/admin/add-admin")} style={addButtonStyle}>Add New Admin</button>
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


