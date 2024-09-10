import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from './admin-layout';
import * as XLSX from 'xlsx';

const SearchPage = () => {
    const [courseName, setCourseName] = useState('');
    const [courses, setCourses] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState(''); // State for error handling
    const [isLoading, setIsLoading] = useState(false); // State for loading indicator
    const router = useRouter();

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/is_admin', { withCredentials: true });
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

    const searchCourses = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/courses/search', {
                params: { course_name: courseName },
                withCredentials: true
            });
            setCourses(response.data);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    router.push('/login');
                } else if (error.response.status === 403) {
                    alert('You do not have permission to access this resource.');
                } else {
                    alert('An error occurred while fetching courses.');
                }
            } else {
                console.error('Error:', error);
                alert('An error occurred while fetching courses.');
            }
        }
    };

    const deleteCourse = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/api/courses/${id}`, { withCredentials: true });
            setCourses(courses.filter(course => course.course_id !== id));
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    router.push('/login');
                } else if (error.response.status === 403) {
                    alert('You do not have permission to delete this course.');
                } else {
                    alert('An error occurred while deleting the course.');
                }
            } else {
                console.error('Error:', error);
                alert('An error occurred while deleting the course.');
            }
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            handleUploadClick(file); // Trigger file upload
        }
    };

    const handleUploadClick = async (file) => {
        setIsLoading(true); // Set loading state to true before starting upload
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            console.log('Parsed Excel data:', jsonData);

            try {
                const response = await axios.post('http://localhost:3001/add-courses-bulk', jsonData, { withCredentials: true });

                if (response.status === 200 && response.data.success) {
                    setError(""); 
                    alert("Courses added successfully.");
                } else {
                    setError(`Failed to add courses: ${response.data.message || 'Unknown error'}`);
                    console.error("Error adding courses:", response.data.message);
                }
            } catch (error) {
                if (error.response && error.response.data && error.response.data.message) {
                    setError(`Failed to add courses: ${error.response.data.message}`);
                } else {
                    setError("Failed to process Excel file. Please try again.");
                }
                console.error("Error uploading Excel file:", error);
            } finally {
                setIsLoading(false); // Reset loading state after upload is complete
            }
        };
        reader.readAsArrayBuffer(file);
    };

    if (!isAdmin) {
        return <p>Loading...</p>;
    }

    return (
        <Layout>
            <div style={styles.container}>
                <h1 style={styles.title}>Search Courses</h1>
                <div style={styles.searchContainer}>
                    <input
                        type="text"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        placeholder="Enter course name"
                        style={styles.searchInput}
                    />
                    <button onClick={searchCourses} style={styles.searchButton}>Search</button>
                </div>

                <ul style={styles.courseList}>
                    {courses.map((course) => (
                        <li key={course.course_id} style={styles.courseItem}>
                            <span>{course.course_name}</span>
                            <div style={styles.courseActions}>
                                <Link href={`/admin/edit-course/${course.course_id}`}>
                                    <button style={styles.editButton}>Edit</button>
                                </Link>
                                <button onClick={() => deleteCourse(course.course_id)} style={styles.deleteButton}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>

                <div style={styles.fileUploadContainer}>
                    {/* Hidden file input */}
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        id="fileInput"
                    />
                    {/* Button to open file dialog */}
                    <button onClick={() => document.getElementById('fileInput').click()} style={styles.uploadButton}>
                        Add courses
                    </button>
                </div>

                {/* Show loading message while uploading */}
                {isLoading && <p>Uploading file, please wait...</p>}

                {error && <p className="error">{error}</p>}
            </div>
        </Layout>
    );
};

const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        borderRadius: '10px',
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#333',
    },
    searchContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
    },
    searchInput: {
        flex: 1,
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        marginRight: '10px',
    },
    searchButton: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    courseList: {
        listStyle: 'none',
        padding: 0,
    },
    courseItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '5px',
        marginBottom: '10px',
    },
    courseActions: {
        display: 'flex',
        gap: '10px',
    },
    editButton: {
        padding: '5px 10px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    deleteButton: {
        padding: '5px 10px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    fileUploadContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        marginTop: '20px',
    },
    uploadButton: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
};

export default SearchPage;
