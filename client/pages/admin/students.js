import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Layout from './admin-layout'; // Assuming Layout is in the components folder
import * as XLSX from "xlsx"; // Import the XLSX library

export default function Students() {
    const [students, setStudents] = useState([]);
    const [error, setError] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null); // State for the selected file
    const [success, setSuccess] = useState(""); // Add success state
    const [isUploading, setIsUploading] = useState(false); // Add uploading state
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
                const response = await axios.get(`http://localhost:3001/admin/students`, { withCredentials: true });
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

    const handleDeleteStudent = async (studentId) => {
        try {
            const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/delete-student/${studentId}`, { withCredentials: true });

            if (response.data.success) {
                setStudents(students.filter(student => student.user_id !== studentId));
            } else {
                setError(response.data.message || "Failed to delete student.");
            }
        } catch (err) {
            console.error("Error deleting student:", err);
            setError("Failed to delete student. Please try again later.");
        }
    };

    const handleEditStudent = (studentId) => {
        router.push(`/admin/edit-student/${studentId}`);
    };

    const handleExcelUpload = async () => {
        if (!selectedFile) {
            setError("No file selected. Please choose an Excel file.");
            setSuccess(""); // Clear any success message
            return;
        }
    
        if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
            setError("Please upload a valid Excel file.");
            setSuccess(""); // Clear any success message
            return;
        }
    
        setError(""); // Clear any previous error
        setSuccess(""); // Clear any previous success message
        setIsUploading(true); // Set uploading state to true
    
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
            console.log("Parsed JSON Data:", jsonData); // Debugging output
    
            try {
                const response = await axios.post('http://localhost:3001/add-students-bulk', jsonData, { withCredentials: true });
                if (response.status === 200 && response.data.success) {
                    setSuccess("Students added successfully.");
                    const updatedStudents = jsonData.map(student => ({
                        first_name: student.first_name || "",
                        last_name: student.last_name || "",
                        email: student.email || "",
                        phone_num: student.phone_num || "",
                        gender: student.gender || "",
                        image: student.image || "",
                        level: student.level || "",
                        password: student.password || ""
                    }));
                    setStudents(prevStudents => {
                        console.log("Previous Students:", prevStudents); // Debugging output
                        console.log("Updated Students:", [...prevStudents, ...updatedStudents]); // Debugging output
                        return [...prevStudents, ...updatedStudents]; // Append new students to the existing list
                    });
                } else {
                    setError(`Failed to add students: ${response.data.message || 'Unknown error'}`);
                }
            } catch (error) {
                setError("Failed to process Excel file. Please try again.");
            } finally {
                setIsUploading(false); // Set uploading state to false
            }
        };
        reader.readAsArrayBuffer(selectedFile);
    };
    
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setError("");
        setSuccess("");
    };

    if (!isAdmin) {
        return <p>Loading...</p>;
    }

    return (
        <Layout>
            <div style={{ padding: "20px" }}>
                <h1>Students</h1>
                {error && <p className="error" style={errorStyle}>{error}</p>}
                {success && <p className="success" style={successStyle}>{success}</p>}
                {isUploading && <p className="uploading" style={uploadingStyle}>Uploading...</p>} {/* Display uploading message */}

                <div className="upload-container">
                    <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="file-input" />
                    <button onClick={handleExcelUpload} disabled={isUploading} style={uploadButtonStyle}>Add Students</button>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>First Name</th>
                            <th style={tableHeaderStyle}>Last Name</th>
                            <th style={tableHeaderStyle}>Email</th>
                            <th style={tableHeaderStyle}>Phone Number</th>
                            <th style={tableHeaderStyle}>Gender</th>
                            <th style={tableHeaderStyle}>Image</th>
                            <th style={tableHeaderStyle}>Level</th>
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
                                    <td style={tableCellStyle}>{student.level}</td>
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
                <button onClick={() => router.push("/admin/add-student")} style={addButtonStyle}>Add New Student</button>
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

const uploadingStyle = {
    color: "blue",
    fontWeight: "bold",
};

const successStyle = {
    color: "green",
    fontWeight: "bold",
};

const uploadButtonStyle = {
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
};

const errorStyle = {
    color: "red",
    fontWeight: "bold",
};



// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import Layout from './admin-layout'; // Assuming Layout is in the components folder
// import * as XLSX from "xlsx"; // Import the XLSX library

// export default function Students() {
//     const [students, setStudents] = useState([]);
//     const [error, setError] = useState("");
//     const [isAdmin, setIsAdmin] = useState(false);
//     const [selectedFile, setSelectedFile] = useState(null); // State for the selected file
//     const [success, setSuccess] = useState(""); // Add success state
//     const router = useRouter();

//     useEffect(() => {
//         const checkAdmin = async () => {
//             try {
//                 const response = await axios.get(`http://localhost:3001/api/is_admin`, { withCredentials: true });
//                 console.log('Admin check response:', response.data);

//                 if (response.data.isAdmin) {
//                     setIsAdmin(true);
//                     fetchStudents();
//                 } else {
//                     router.push('/login');
//                 }
//             } catch (err) {
//                 console.error('Error checking admin status:', err);
//                 if (err.response && err.response.status === 403) {
//                     router.push('/login');
//                 } else {
//                     setError("Failed to verify admin status.");
//                 }
//             }
//         };

//         const fetchStudents = async () => {
//             try {
//                 const response = await axios.get(`http://localhost:3001/admin/students`, { withCredentials: true });
//                 console.log('Fetch students response:', response.data);

//                 if (response.data && Array.isArray(response.data)) {
//                     setStudents(response.data);
//                 } else {
//                     setError("Unexpected response format.");
//                 }
//             } catch (err) {
//                 console.error("Error fetching students:", err);

//                 if (err.response) {
//                     if (err.response.status === 401) {
//                         router.push('/login');
//                     } else if (err.response.status === 403) {
//                         setError("You do not have permission to access this data.");
//                     } else {
//                         setError("Failed to load students. Please try again later.");
//                     }
//                 } else {
//                     setError("Failed to load students. Please try again later.");
//                 }
//             }
//         };

//         checkAdmin();
//     }, [router]);

//     const handleDeleteStudent = async (studentId) => {
//         try {
//             const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/delete-student/${studentId}`, { withCredentials: true });

//             if (response.data.success) {
//                 setStudents(students.filter(student => student.user_id !== studentId));
//             } else {
//                 setError(response.data.message || "Failed to delete student.");
//             }
//         } catch (err) {
//             console.error("Error deleting student:", err);
//             setError("Failed to delete student. Please try again later.");
//         }
//     };

//     const handleEditStudent = (studentId) => {
//         router.push(`/admin/edit-student/${studentId}`);
//     };

//     // if (error) {
//     //     return <p style={{ color: "red" }}>{error}</p>;
//     // }

//     const handleExcelUpload = async () => {
//         if (!selectedFile) {
//             setError("No file selected. Please choose an Excel file.");
//             setSuccess(""); // Clear any success message
//             return;
//         }
    
//         if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
//             setError("Please upload a valid Excel file.");
//             setSuccess(""); // Clear any success message
//             return;
//         }
    
//         setError(""); // Clear any previous error
//         setSuccess(""); // Clear any previous success message
    
//         const reader = new FileReader();
//         reader.onload = async (e) => {
//             const data = new Uint8Array(e.target.result);
//             const workbook = XLSX.read(data, { type: 'array' });
//             const sheetName = workbook.SheetNames[0];
//             const worksheet = workbook.Sheets[sheetName];
//             const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
//             console.log("Parsed JSON Data:", jsonData); // Debugging output
    
//             try {
//                 const response = await axios.post('http://localhost:3001/add-students-bulk', jsonData, { withCredentials: true });
//                 if (response.status === 200 && response.data.success) {
//                     setSuccess("Students added successfully.");
//                     const updatedStudents = jsonData.map(student => ({
//                         first_name: student.first_name || "",
//                         last_name: student.last_name || "",
//                         email: student.email || "",
//                         phone_num: student.phone_num || "",
//                         gender: student.gender || "",
//                         image: student.image || "",
//                         level: student.level || "",
//                         password: student.password || ""
//                     }));
//                     setStudents(prevStudents => {
//                         console.log("Previous Students:", prevStudents); // Debugging output
//                         console.log("Updated Students:", [...prevStudents, ...updatedStudents]); // Debugging output
//                         return [...prevStudents, ...updatedStudents]; // Append new students to the existing list
//                     });
//                 } else {
//                     setError(`Failed to add students: ${response.data.message || 'Unknown error'}`);
//                 }
//             } catch (error) {
//                 setError("Failed to process Excel file. Please try again.");
//             }
//         };
//         reader.readAsArrayBuffer(selectedFile);
//     };
    
//     const handleFileChange = (event) => {
//         setSelectedFile(event.target.files[0]);
//         setError("");
//         setSuccess("");
//     };
//     if (!isAdmin) {
//         return <p>Loading...</p>;
//     }

//     return (
//         <Layout>
//             <div style={{ padding: "20px" }}>
//                 <h1>Students</h1>
//                 {/* {error && <p style={{ color: "red" }}>{error}</p>} */}
//                 {error && <p className="error">{error}</p>}
//                 {success && <p className="success">{success}</p>} {/* Success message */}

//                 <div className="upload-container">
//                     <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="file-input" />
//                     <button onClick={handleExcelUpload}>Upload</button>
//                 </div>
//                 <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
//                     <thead>
//                         <tr>
//                             <th style={tableHeaderStyle}>First Name</th>
//                             <th style={tableHeaderStyle}>Last Name</th>
//                             <th style={tableHeaderStyle}>Email</th>
//                             <th style={tableHeaderStyle}>Phone Number</th>
//                             <th style={tableHeaderStyle}>Gender</th>
//                             <th style={tableHeaderStyle}>Image</th>
//                             <th style={tableHeaderStyle}>Level</th>
//                             <th style={tableHeaderStyle}>Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {students.length > 0 ? (
//                             students.map((student) => (
//                                 <tr key={student.user_id} style={tableRowStyle}>
//                                     <td style={tableCellStyle}>{student.first_name}</td>
//                                     <td style={tableCellStyle}>{student.last_name}</td>
//                                     <td style={tableCellStyle}>{student.email}</td>
//                                     <td style={tableCellStyle}>{student.phone_num}</td>
//                                     <td style={tableCellStyle}>{student.gender}</td>
//                                     <td style={tableCellStyle}>
//                                         {student.image ? (
//                                             <img
//                                                 src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${student.image}`}
//                                                 alt="Profile"
//                                                 width="50"
//                                             />
//                                         ) : (
//                                             "No Image"
//                                         )}
//                                     </td>
//                                     <td style={tableCellStyle}>{student.level}</td>
//                                     <td style={tableCellStyle}>
//                                         <button onClick={() => handleEditStudent(student.user_id)} style={buttonStyle}>Edit</button>
//                                         <button onClick={() => handleDeleteStudent(student.user_id)} style={buttonStyle}>Delete</button>
//                                     </td>
//                                 </tr>
//                             ))
//                         ) : (
//                             <tr>
//                                 <td colSpan="8" style={tableCellStyle}>No students found.</td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//                 <button onClick={() => router.push("/admin/add-student")} style={addButtonStyle}>Add New Student</button>
//             </div>
//         </Layout>
//     );
// }

// const tableHeaderStyle = {
//     padding: "10px",
//     backgroundColor: "#f2f2f2",
//     borderBottom: "2px solid #ddd",
//     textAlign: "left",
// };

// const tableRowStyle = {
//     borderBottom: "1px solid #ddd",
// };

// const tableCellStyle = {
//     padding: "10px",
// };

// const buttonStyle = {
//     marginRight: "10px",
//     padding: "5px 10px",
//     backgroundColor: "#007BFF",
//     color: "#fff",
//     border: "none",
//     borderRadius: "4px",
//     cursor: "pointer",
// };

// const addButtonStyle = {
//     padding: "10px 20px",
//     backgroundColor: "#007BFF",
//     color: "#fff",
//     border: "none",
//     borderRadius: "4px",
//     cursor: "pointer",
// };


