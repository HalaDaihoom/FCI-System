

// import Link from 'next/link';
// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/router';

// export default function Profile() {
//     const [user, setUser] = useState(null);
//     const [error, setError] = useState(null);
//     const router = useRouter();

//     useEffect(() => {
//         const fetchProfile = async () => {
//             try {
//                 const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/student/profile`, { 
//                     withCredentials: true 
//                 });

//                 if (response.data.success) {
//                     setUser(response.data.profile);
//                 } else {
//                     setError(response.data.message || "Failed to load profile.");
//                 }
//             } catch (err) {
//                 console.error("Profile fetch error:", err);

//                 if (err.response) {
//                     console.error('Error Response:', err.response);
//                     if (err.response.status === 401) {
//                         // Redirect to login if unauthorized
//                         router.push('/login');
//                     } else if (err.response.status === 403) {
//                         // Show forbidden message
//                         setError("You do not have permission to view this profile.");
//                     } else {
//                         // Handle other types of errors
//                         setError("Failed to load profile. Please try again later.");
//                     }
//                 } else {
//                     setError("Failed to load profile. Please try again later.");
//                 }
//             }
//         };

//         fetchProfile();
//     }, [router]);

//     if (error) return <div>Error fetching profile: {error}</div>;
//     if (!user) return <div>Loading...</div>;
//     const handleCoursesClick = () => {
//         router.push(`/student/courses?level=${user.level}`);
//     };

//     const handleNotificationClick = () => {
//         const url = `/student/receive_notification?student_id=${user.user_id}`;
//         console.log("Redirecting to:", url); // Log the URL
//         router.push(url);
//     };

//     const handleMessageClick = () => {
//         const url = `/student/send_message`;
//         console.log("Redirecting to:", url); // Log the URL
//         router.push(url);
//     };

//     const handleMapClick = () => {
//         const url = `/student/map`;
//         console.log("Redirecting to:", url); // Log the URL
//         router.push(url);
//     };

//     const handleLogoutClick = async () => {
//         const url = `/`;
//         console.log("Redirecting to:", url); // Log the URL
//         router.push(url);
//     };

//     return (
//         <div style={styles.container}>
//             <Link href="/files/Internal_Regulation_2011.pdf" style={styles.link}>Internal Regulation</Link>
//             <div style={styles.buttonContainer}>
//                 <button style={styles.button} onClick={handleCoursesClick}>View Courses</button>
//                 <button style={styles.button} onClick={handleNotificationClick}>Notification</button>
//                 <button style={styles.button} onClick={handleMessageClick}>Contact With Admin</button>
//                 <button style={styles.button} onClick={handleMapClick}>Map</button>

//                 <button style={styles.logoutButton} onClick={handleLogoutClick}>LogOut</button>
//             </div>

//             <h1 style={styles.heading}>Profile Information</h1>
//             <img 
//                 src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${user.image}`} 
//                 alt="Profile Picture" 
//                 style={styles.profileImage} 
//             />

//             <p style={styles.info}><strong>First Name:</strong> {user.first_name}</p>
//             <p style={styles.info}><strong>Last Name:</strong> {user.last_name}</p>
//             <p style={styles.info}><strong>Email:</strong> {user.email}</p>
//             {user.level && <p style={styles.info}><strong>Level:</strong> {user.level}</p>}
//             <p style={styles.info}><strong>Gender:</strong> {user.gender}</p>
//         </div>
//     );
// }

// const styles = {
//     container: {
//         padding: "20px",
//         maxWidth: "600px",
//         margin: "auto",
//         backgroundColor: "#f5f7fa", // Light background for a fresh look
//         borderRadius: "10px",
//         boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
//     },
//     link: {
//         display: "block",
//         marginBottom: "15px",
//         textDecoration: "none",
//         color: "#0070f3", // Blue link color
//         fontWeight: "bold",
//     },
//     buttonContainer: {
//         display: "flex",
//         justifyContent: "space-between",
//         marginBottom: "20px",
//     },
//     button: {
//         backgroundColor: "#0070f3", // Blue button color
//         color: "#fff",
//         border: "none",
//         padding: "10px 15px",
//         borderRadius: "5px",
//         cursor: "pointer",
//         fontWeight: "bold",
//         fontSize: "14px",
//         transition: "background-color 0.3s",
//     },
//     logoutButton: {
//         backgroundColor: "#f54242", // Red button color for logout
//         color: "#fff",
//         border: "none",
//         padding: "10px 15px",
//         borderRadius: "5px",
//         cursor: "pointer",
//         fontWeight: "bold",
//         fontSize: "14px",
//         transition: "background-color 0.3s",
//     },
//     buttonHover: {
//         backgroundColor: "#005bb5", // Darker blue on hover
//     },
//     logoutButtonHover: {
//         backgroundColor: "#d42d2d", // Darker red on hover
//     },
//     heading: {
//         color: "#333",
//         fontSize: "24px",
//         marginBottom: "20px",
//         textAlign: "center",
//     },
//     profileImage: {
//         width: "150px",
//         height: "150px",
//         borderRadius: "50%",
//         display: "block",
//         margin: "auto",
//         marginBottom: "20px",
//         border: "3px solid #0070f3",
//     },
//     info: {
//         color: "#555",
//         fontSize: "16px",
//         marginBottom: "10px",
//     },
// };

