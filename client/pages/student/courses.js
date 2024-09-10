import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../layout';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserDataAndCourses = async () => {
      try {
        setLoading(true);
        
        const userResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/student/profile`, { withCredentials: true });
        console.log('User Data Response:', userResponse.data);

        if (userResponse.data.success && userResponse.data.profile) {
          const userData = userResponse.data.profile;
          setUser(userData);

          if (userData.level) {
            setLevel(userData.level);
            
            const coursesResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/student/courses`, {
              params: { level: userData.level },
              withCredentials: true
            });

            console.log('Courses Response:', coursesResponse.data);
            setCourses(coursesResponse.data);
            setError(null);
          } else {
            setError('User level not found.');
          }
        } else {
          setError('Failed to retrieve user profile.');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response) {
          if (err.response.status === 401) {
            router.push('/login');
          } else if (err.response.status === 403) {
            setError('You do not have permission to access this data.');
          } else {
            setError(`Error fetching data. Status code: ${err.response.status}`);
          }
        } else {
          setError('Error fetching data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndCourses();
  }, [router]);

  const handleCourseClick = (courseId) => {
    router.push(`/student/courses/${courseId}`);
  };

  return (
    <Layout user={user}>
      <div className="container">
        <h1>Your Courses</h1>
        <h2>Level {level}</h2>
        {loading ? (
          <div className="course-grid">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="course-card skeleton"></div>
            ))}
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : courses.length > 0 ? (
          <div className="course-grid">
            {courses.map((course) => (
              <div 
                key={course.course_id}
                className="course-card"
                onClick={() => handleCourseClick(course.course_id)}
              >
                <div className="course-icon">📚</div>
                <h3>{course.course_name}</h3>
                <div className="course-details">Click to view details</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-courses">No courses available for this level.</div>
        )}
      </div>
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: 'Inter', sans-serif;
        }

        h1 {
          font-size: 2.5rem;
          color: #2d3748;
          margin-bottom: 10px;
          text-align: center;
        }

        h2 {
          font-size: 1.5rem;
          color: #4a5568;
          margin-bottom: 30px;
          text-align: center;
        }

        .course-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 30px;
        }

        .course-card {
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
          padding: 30px;
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .course-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .course-icon {
          font-size: 3rem;
          margin-bottom: 15px;
        }

        .course-card h3 {
          font-size: 1.4rem;
          color: #2d3748;
          margin-bottom: 10px;
        }

        .course-details {
          font-size: 0.9rem;
          color: #718096;
        }

        .error-message {
          background-color: #fed7d7;
          color: #9b2c2c;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          margin-top: 20px;
        }

        .no-courses {
          text-align: center;
          font-size: 1.2rem;
          color: #4a5568;
          margin-top: 30px;
        }

        @keyframes shimmer {
          0% {
            background-position: -468px 0;
          }
          100% {
            background-position: 468px 0;
          }
        }

        .skeleton {
          animation: shimmer 1.5s infinite linear;
          background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
          background-size: 800px 104px;
          height: 200px;
        }
      `}</style>
    </Layout>
  );
};

export default CoursesPage;







// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/router';
// import Layout from '../layout';

// const CoursesPage = () => {
//   const [courses, setCourses] = useState([]);
//   const [level, setLevel] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [user, setUser] = useState(null);
//   const router = useRouter();

//   // Fetch user data and courses
//   useEffect(() => {
//     const fetchUserDataAndCourses = async () => {
//       try {
//         setLoading(true);
        
//         // Fetch user data
//         const userResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/student/profile`, { withCredentials: true });
//         console.log('User Data Response:', userResponse.data);

//         if (userResponse.data.success && userResponse.data.profile) {
//           const userData = userResponse.data.profile;
//           setUser(userData);

//           if (userData.level) {
//             setLevel(userData.level);
            
//             // Fetch courses for the user level
//             const coursesResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/student/courses`, {
//               params: { level: userData.level },
//               withCredentials: true
//             });

//             console.log('Courses Response:', coursesResponse.data);
//             setCourses(coursesResponse.data);
//             setError(null); // Clear any previous errors
//           } else {
//             setError('User level not found.');
//           }
//         } else {
//           setError('Failed to retrieve user profile.');
//         }
//       } catch (err) {
//         console.error('Error fetching data:', err);
//         if (err.response) {
//           if (err.response.status === 401) {
//             router.push('/login');
//           } else if (err.response.status === 403) {
//             setError('You do not have permission to access this data.');
//           } else {
//             setError(`Error fetching data. Status code: ${err.response.status}`);
//           }
//         } else {
//           setError('Error fetching data. Please try again later.');
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserDataAndCourses();
//   }, [router]);

//   const handleCourseClick = (courseId) => {
//     router.push(`/student/courses/${courseId}`);
//   };

//   return (
//     <Layout user={user}>
//       <div className="container">
//         <h1>Courses for Level {level}</h1>
//         {loading && <p className="loading">Loading...</p>}
//         {error && <p className="error">{error}</p>}
//         {courses.length > 0 ? (
//           <div className="courseGrid">
//             {courses.map((course) => (
//               <div 
//                 key={course.course_id} // Use course_id as the unique key
//                 className="courseBox"
//                 onClick={() => handleCourseClick(course.course_id)}
//               >
//                 <h2>{course.course_name}</h2>
//               </div>
//             ))}
//           </div>
//         ) : (
//           !loading && <p className="noCourses">No courses available for this level.</p>
//         )}
//       </div>
//       <style jsx>{`
//         .container {
//           padding: 20px;
//           max-width: 800px;
//           margin: 0 auto;
//         }

//         h1 {
//           font-size: 2rem;
//           margin-bottom: 20px;
//           color: #2c3e50;
//           text-align: center;
//         }

//         .courseGrid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
//           gap: 20px;
//         }

//         .courseBox {
//           background-color: #ecf0f1;
//           border-radius: 8px;
//           padding: 15px;
//           text-align: center;
//           cursor: pointer;
//           box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//           transition: transform 0.2s, box-shadow 0.2s;
//         }

//         .courseBox:hover {
//           transform: translateY(-5px);
//           box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
//         }

//         .courseBox h2 {
//           font-size: 1.2rem;
//           color: #2980b9;
//         }
//           .loading {
//           text-align: center;
//           font-size: 1.2rem;
//           color: #3498db;
//         }

//         .error {
//           text-align: center;
//           font-size: 1.2rem;
//           color: red;
//         }

//         .noCourses {
//           text-align: center;
//           font-size: 1.2rem;
//           color: #7f8c8d;
//         }
//       `}</style>
//     </Layout>
//   );
// };

// export default CoursesPage;

