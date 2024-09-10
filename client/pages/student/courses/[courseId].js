import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../layout'; // Adjust the path if needed

const CourseDetails = () => {
    const router = useRouter();
    const { courseId } = router.query;
    const [course, setCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [textContents, setTextContents] = useState({}); // State to store text content

    useEffect(() => {
        if (courseId) {
            fetchCourseDetails();
        }
    }, [courseId]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/student/profile`, { withCredentials: true });
                if (response.data.success) {
                    setUser(response.data.profile);
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                router.push('/login');
            }
        };

        fetchUser();
    }, [router]);

    const fetchCourseDetails = async () => {
        setLoading(true);
        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/student/courses/${courseId}`;
            const response = await axios.get(url);
            if (response.data && Object.keys(response.data).length > 0) {
                setCourse(response.data);
                setError(null);
            } else {
                setError('Received empty course data');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error fetching course details');
        } finally {
            setLoading(false);
        }
    };

    const fetchMaterials = async () => {
        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/student/courses/${courseId}/materials`;
            const response = await axios.get(url);
            if (response.data && response.data.length > 0) {
                setMaterials(response.data);
                setError(null);
                // Fetch text contents for text files
                const textContentsPromises = response.data
                    .filter(material => getFileExtension(material.file_name) === 'txt')
                    .map(async (material) => {
                        const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/student/courses/${courseId}/materials/${material.file_id}`;
                        const text = await fetchTextContent(fileUrl);
                        return { [material.file_id]: text };
                    });
                const textContentsArray = await Promise.all(textContentsPromises);
                const newTextContents = Object.assign({}, ...textContentsArray);
                setTextContents(newTextContents);
            } else {
                setMaterials([]);
                setError('No materials found for this course.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error fetching course materials');
        }
    };

    const handleMaterialsClick = () => {
        fetchMaterials();
    };

    if (loading) return <Layout><div className="loading">Loading...</div></Layout>;
    if (error) return <Layout><div className="error">Error: {error}</div></Layout>;

    return (
        <Layout user={user}>
            <div className="container">
                <div className="course-header">
                    <h1>{course?.course_name || 'Course Details'}</h1>
                    <button onClick={handleMaterialsClick} className="materials-btn">View Materials</button>
                </div>
                {course ? (
                    <div className="course-details">
                        <div className="detail-item">
                            <span className="label">Code:</span>
                            <span className="value">{course.course_code || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Credits:</span>
                            <span className="value">{course.credit || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Level:</span>
                            <span className="value">{course.level || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Description:</span>
                            <span className="value">{course.course_description || 'N/A'}</span>
                        </div>
                       
                    </div>
                ) : (
                    <p className="not-found">Course not found</p>
                )}

                {materials.length > 0 && (
                    <div className="materials-container">
                        <h2>Course Materials</h2>
                        <div className="materials-grid">
                            {materials.map((material) => (
                                <div key={material.file_id} className="material-item">
                                    {renderMaterial(material, courseId, textContents)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {error && <p className="error">{error}</p>}
            </div>
            <style jsx>{`
                .container {
                    max-width: 800px;
                    margin: 2rem auto;
                    padding: 2rem;
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .course-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                h1 {
                    color: #2c3e50;
                    font-size: 2.5rem;
                    margin: 0;
                }
                .materials-btn {
                    background-color: #3498db;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    font-size: 1rem;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }
                .materials-btn:hover {
                    background-color: #2980b9;
                }
                .course-details {
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    padding: 1.5rem;
                }
                .detail-item {
                    margin-bottom: 1rem;
                }
                .label {
                    font-weight: bold;
                    color: #34495e;
                    display: inline-block;
                    width: 120px;
                }
                .value {
                    color: #2c3e50;
                }
                .materials-container {
                    margin-top: 2rem;
                }
                .materials-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }
                .material-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background-color: #f1f1f1;
                    padding: 1rem;
                    border-radius: 8px;
                }
                .material-image {
                    max-width: 100%;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }
                .material-pdf {
                    width: 100%;
                    height: 500px;
                    border: none;
                    margin-bottom: 1rem;
                }
                .material-txt {
                    width: 100%;
                    max-height: 500px;
                    overflow: auto;
                    background-color: #ffffff;
                    padding: 1rem;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    margin-bottom: 1rem;
                }
                .material-link {
                    color: #2980b9;
                    text-decoration: none;
                    font-weight: bold;
                }
                .material-link:hover {
                    text-decoration: underline;
                }
                .loading, .error, .not-found {
                    text-align: center;
                    font-size: 1.2rem;
                    padding: 2rem;
                }
                .loading {
                    color: #3498db;
                }
                .error {
                    color: #e74c3c;
                }
                .not-found {
                    color: #95a5a6;
                }
            `}</style>
        </Layout>
    );
};

// Helper function to render different file types
const renderMaterial = (material, courseId, textContents) => {
    const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/student/courses/${courseId}/materials/${material.file_id}`;
    const fileExtension = getFileExtension(material.file_name);

    switch (fileExtension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
            return (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    <img src={fileUrl} className="material-image" alt={material.file_name} />
                </a>
            );
        case 'pdf':
            return (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    <iframe src={fileUrl} className="material-pdf" title={material.file_name}></iframe>
                </a>
            );
        case 'txt':
            return (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    <div className="material-txt">
                        {textContents[material.file_id] || 'Loading text content...'}
                    </div>
                </a>
            );
        default:
            return (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="material-link">
                    Open {material.file_name}
                </a>
            );
    }
};

// Helper function to get file extension
const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
};

// Helper function to fetch and display text content
const fetchTextContent = async (fileUrl) => {
    try {
        const response = await fetch(fileUrl);
        const text = await response.text();
        return text;
    } catch (error) {
        console.error('Error fetching text content:', error);
        return 'Error loading text content';
    }
};

export default CourseDetails;


// import { useRouter } from 'next/router';
// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import Layout from '../../layout'; // Adjust the path if needed

// const CourseDetails = () => {
//     const router = useRouter();
//     const { courseId } = router.query;
//     const [course, setCourse] = useState(null);
//     const [error, setError] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [user, setUser] = useState(null);

//     useEffect(() => {
//         console.log(`CourseId: ${courseId}`);
//         if (courseId) {
//             fetchCourseDetails();
//         }
//     }, [courseId]);

//     useEffect(() => {
//         // Check if the user is authenticated
//         const fetchUser = async () => {
//           try {
//             const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/student/profile`, { withCredentials: true });
//             if (response.data.success) {
//               setUser(response.data.profile);
//             } else {
//               router.push('/login');
//             }
//           } catch (error) {
//             console.error('Error fetching user data:', error);
//             router.push('/login');
//           }
//         };
    
//         fetchUser();
//       }, [router]);
    
//     const fetchCourseDetails = async () => {
//         setLoading(true);
//         try {
//             const url = `${process.env.NEXT_PUBLIC_API_URL}/api/student/courses/${courseId}`;
//             console.log(`Fetching from URL: ${url}`);
//             const response = await axios.get(url);
//             console.log('Raw response:', response);
//             console.log('Course data received:', JSON.stringify(response.data, null, 2));
            
//             if (response.data && Object.keys(response.data).length > 0) {
//                 setCourse(response.data);
//                 setError(null);
//             } else {
//                 setError('Received empty course data');
//             }
//         } catch (err) {
//             console.error('Error fetching course details:', err);
//             setError(err.response?.data?.message || err.message || 'Error fetching course details');
//         } finally {
//             setLoading(false);
//         }
//     };
    
//     if (loading) return <Layout><p>Loading...</p></Layout>;
//     if (error) return <Layout><p>Error: {error}</p></Layout>;

//     return (
//         <Layout user={user}>
//             <div className="container">
//                 <div className="image-container">
//                     <img src="/static/course-image.jpg" alt="Course" />
//                 </div>
//                 <div className="details-container">
//                     {course ? (
//                         <div>
//                             {console.log('Rendering course data:', JSON.stringify(course, null, 2))}
//                             <h1>{course.course_name || 'No name available'}</h1>
//                             <p><strong>Code:</strong> {course.course_code || 'N/A'}</p>
//                             <p><strong>Description:</strong> {course.course_description || 'N/A'}</p>
//                             <p><strong>Credits:</strong> {course.credit || 'N/A'}</p>
//                             <p><strong>Level:</strong> {course.level || 'N/A'}</p>
//                         </div>
//                     ) : (
//                         <p>Course not found</p>
//                     )}
//                 </div>
//             </div>
//             <style jsx>{`
//                 .container {
//                     display: flex;
//                     flex-direction: row;
//                     justify-content: center;
//                     align-items: flex-start;
//                     padding: 20px;
//                     max-width: 800px;
//                     margin: 0 auto;
//                     background-color: #f9f9f9;
//                     border-radius: 8px;
//                     box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//                 }
//                 .image-container {
//                     flex: 1;
//                     margin-right: 20px;
//                 }
//                 .image-container img {
//                     width: 100%;
//                     height: auto;
//                     border-radius: 8px;
//                 }
//                 .details-container {
//                     flex: 2;
//                     padding: 20px;
//                     background-color: #fff;
//                     border-radius: 8px;
//                     box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//                 }
//                 h1 {
//                     color: #2c3e50;
//                     font-size: 2rem;
//                     margin-bottom: 10px;
//                 }
//                 p {
//                     margin-bottom: 10px;
//                     font-size: 1rem;
//                     color: #333;
//                 }
//                 strong {
//                     color: #2980b9;
//                 }
//             `}</style>
//         </Layout>
//     );
// };

// export default CourseDetails;