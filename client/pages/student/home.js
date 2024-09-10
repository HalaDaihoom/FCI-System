import Link from 'next/link';
import { FaUserCircle, FaBell } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../layout'; // Assuming Layout is in the components folder

export default function Home({ user }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = ['/image2.jpg', '/image3.jpg', '/image4.jpg'];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(intervalId);
  }, [images.length]);

  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    imageSlider: {
      position: 'relative',
      width: '100%',
      height: '500px',
      margin: '40px 0',
      overflow: 'hidden',
    },
    slide: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      opacity: 0,
      transition: 'opacity 1s ease-in-out',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.5s ease',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0,
      transition: 'opacity 0.3s ease-in-out',
      padding: '20px',
      zIndex: 1,
    },
    slideHover: {
      opacity: 1,
      zIndex: 1,
    },
    welcomeText: {
      textAlign: 'center',
      fontSize: '24px',
      fontWeight: 'normal',
      margin: 0,
    },
    highlightedText: {
      fontSize: '36px', // Larger size for the highlighted text
      fontWeight: 'bold',
    },
    informationHeader: {
      margin: '60px 0 40px',
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#333',
    },
    twoColumnSection: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      margin: '60px 0',
    },
    imageContainer: {
      flex: 1,
      padding: '20px',
    },
    sectionImage: {
      width: '100%',
      height: 'auto',
      maxHeight: '400px',
      objectFit: 'cover',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.6)',
    },
    textContainer: {
      flex: 1,
      padding: '20px',
      textAlign: 'left',
    },
    sectionSeparator: {
      height: '2px',
      background: 'linear-gradient(to right, transparent, #ddd, transparent)',
      margin: '60px 0',
    },
    footer: {
      marginTop: '60px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderTop: '1px solid #ddd',
    },
  };

  return (
    <Layout user={user}>
      <div style={styles.container}>
        <div style={styles.imageSlider}>
          {images.map((img, index) => (
            <div
              key={index}
              style={{
                ...styles.slide,
                opacity: index === currentIndex ? 1 : 0,
                zIndex: index === currentIndex ? 1 : 0,
              }}
              onMouseEnter={(e) => e.currentTarget.querySelector('.overlay').style.opacity = 1}
              onMouseLeave={(e) => e.currentTarget.querySelector('.overlay').style.opacity = 0}
            >
              <img src={img} alt={`Slider Image ${index + 1}`} style={styles.image} />
              <div className="overlay" style={styles.overlay}>
                <div style={styles.welcomeText}>
                  <p>
                    Welcome to <br />
                    <span style={styles.highlightedText}>Faculty of Computers and Information</span><br />
                    Assiut University
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 style={styles.informationHeader}>Information</h2>

        <main>
          <section style={styles.twoColumnSection}>
            <div style={styles.imageContainer}>
              <img src="/web.jpg" alt="About Website" style={styles.sectionImage} />
            </div>
            <div style={styles.textContainer}>
              <h1>About the Website</h1>
              <p>
                This website aims to provide comprehensive information and resources for our college community. It
                features easy navigation, up-to-date content, and interactive elements to enhance user experience.
              </p>
            </div>
          </section>

          <div style={styles.sectionSeparator}></div>

          <section style={styles.twoColumnSection}>
            <div style={styles.textContainer}>
              <h1>About the Staff</h1>
              <p>
                Our staff comprises highly qualified professionals dedicated to providing excellent education and
                support. With diverse expertise and years of experience, they are committed to nurturing the growth and
                success of our students.
              </p>
            </div>
            <div style={styles.imageContainer}>
              <img src="/staff.jpg" alt="Staff" style={styles.sectionImage} />
            </div>
          </section>

          <div style={styles.sectionSeparator}></div>

          <section style={styles.twoColumnSection}>
            <div style={styles.imageContainer}>
              <img src="/image6.jpg" alt="College" style={styles.sectionImage} />
            </div>
            <div style={styles.textContainer}>
              <h1>About the College</h1>
              <p>
                Founded in [year], our college has a rich history of academic excellence and innovation. We offer a wide
                range of programs, state-of-the-art facilities, and a vibrant campus life. Our mission is to empower
                students with knowledge, skills, and values to excel in their chosen fields and contribute positively to
                society.
              </p>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}

// Fetch user data server-side
export async function getServerSideProps(context) {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/student/profile`, {
      headers: {
        Cookie: context.req.headers.cookie || '',
      },
    });

    if (response.data.success) {
      return {
        props: {
          user: response.data.profile,
        },
      };
    } else {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}


// import Link from 'next/link';
// import { FaUserCircle, FaBell } from 'react-icons/fa';
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import Layout from '../layout'; // Assuming Layout is in the components folder

// export default function Home({ user }) {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const images = ['/image2.jpg', '/image3.jpg', '/image4.jpg'];

//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
//     }, 5000); // Change image every 5 seconds

//     return () => clearInterval(intervalId);
//   }, [images.length]);

//   const styles = {
//     container: {
//       fontFamily: 'Arial, sans-serif',
//       textAlign: 'center',
//       padding: '20px',
//       maxWidth: '1200px',
//       margin: '0 auto',
//     },
//     imageSlider: {
//       position: 'relative',
//       width: '100%',
//       height: '500px',
//       margin: '40px 0',
//       overflow: 'hidden',
//     },
//     slide: {
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       width: '100%',
//       height: '100%',
//       opacity: 0,
//       transition: 'opacity 1s ease-in-out',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       overflow: 'hidden',
//     },
//     image: {
//       width: '100%',
//       height: '100%',
//       objectFit: 'cover',
//       transition: 'transform 0.5s ease',
//     },
//     overlay: {
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       width: '100%',
//       height: '100%',
//       backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay
//       color: '#fff',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       opacity: 0,
//       transition: 'opacity 0.3s ease-in-out',
//       padding: '20px',
//       zIndex: 1,
//     },
//     slideHover: {
//       opacity: 1,
//       zIndex: 1,
//     },
//     welcomeText: {
//       textAlign: 'center',
//       fontSize: '24px',
//       fontWeight: 'normal',
//       margin: 0,
//     },
//     highlightedText: {
//       fontSize: '36px', // Larger size for the highlighted text
//       fontWeight: 'bold',
//     },
//     informationHeader: {
//       margin: '60px 0 40px',
//       fontSize: '32px',
//       fontWeight: 'bold',
//       color: '#333',
//     },
//     twoColumnSection: {
//       display: 'flex',
//       flexDirection: 'row',
//       alignItems: 'center',
//       margin: '60px 0',
//     },
//     imageContainer: {
//       flex: 1,
//       padding: '20px',
//     },
//     sectionImage: {
//       width: '100%',
//       height: 'auto',
//       maxHeight: '400px',
//       objectFit: 'cover',
//       borderRadius: '8px',
//       boxShadow: '0 4px 8px rgba(0,0,0,0.6)',
//     },
//     textContainer: {
//       flex: 1,
//       padding: '20px',
//       textAlign: 'left',
//     },
//     sectionSeparator: {
//       height: '2px',
//       background: 'linear-gradient(to right, transparent, #ddd, transparent)',
//       margin: '60px 0',
//     },
//     footer: {
//       marginTop: '60px',
//       padding: '20px',
//       backgroundColor: '#f8f9fa',
//       borderTop: '1px solid #ddd',
//     },
//   };

//   return (
//     <Layout user={user}>
//       <div style={styles.container}>
//         <div style={styles.imageSlider}>
//           {images.map((img, index) => (
//             <div
//               key={index}
//               style={{
//                 ...styles.slide,
//                 opacity: index === currentIndex ? 1 : 0,
//                 zIndex: index === currentIndex ? 1 : 0,
//               }}
//               onMouseEnter={(e) => e.currentTarget.querySelector('.overlay').style.opacity = 1}
//               onMouseLeave={(e) => e.currentTarget.querySelector('.overlay').style.opacity = 0}
//             >
//               <img src={img} alt={`Slider Image ${index + 1}`} style={styles.image} />
//               <div className="overlay" style={styles.overlay}>
//                 <div style={styles.welcomeText}>
//                   <p>
//                     Welcome to <br />
//                     <span style={styles.highlightedText}>Faculty of Computers and Information</span><br />
//                     Assiut University
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <h2 style={styles.informationHeader}>Information</h2>

//         <main>
//           <section style={styles.twoColumnSection}>
//             <div style={styles.imageContainer}>
//               <img src="/web.jpg" alt="About Website" style={styles.sectionImage} />
//             </div>
//             <div style={styles.textContainer}>
//               <h1>About the Website</h1>
//               <p>
//                 This website aims to provide comprehensive information and resources for our college community. It
//                 features easy navigation, up-to-date content, and interactive elements to enhance user experience.
//               </p>
//             </div>
//           </section>

//           <div style={styles.sectionSeparator}></div>

//           <section style={styles.twoColumnSection}>
//             <div style={styles.textContainer}>
//               <h1>About the Staff</h1>
//               <p>
//                 Our staff comprises highly qualified professionals dedicated to providing excellent education and
//                 support. With diverse expertise and years of experience, they are committed to nurturing the growth and
//                 success of our students.
//               </p>
//             </div>
//             <div style={styles.imageContainer}>
//               <img src="/staff.jpg" alt="Staff" style={styles.sectionImage} />
//             </div>
//           </section>

//           <div style={styles.sectionSeparator}></div>

//           <section style={styles.twoColumnSection}>
//             <div style={styles.imageContainer}>
//               <img src="/image6.jpg" alt="College" style={styles.sectionImage} />
//             </div>
//             <div style={styles.textContainer}>
//               <h1>About the College</h1>
//               <p>
//                 Founded in [year], our college has a rich history of academic excellence and innovation. We offer a wide
//                 range of programs, state-of-the-art facilities, and a vibrant campus life. Our mission is to empower
//                 students with knowledge, skills, and values to excel in their chosen fields and contribute positively to
//                 society.
//               </p>
//             </div>
//           </section>
//         </main>
//       </div>
//     </Layout>
//   );
// }

// // Fetch user data server-side
// export async function getServerSideProps(context) {
//   try {
//       const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/student/profile`, {
//           headers: {
//               Cookie: context.req.headers.cookie || '',
//           },
//       });

//       if (response.data.success) {
//           return {
//               props: {
//                   user: response.data.profile,
//               },
//           };
//       } else {
//           return {
//               redirect: {
//                   destination: '/login',
//                   permanent: false,
//               },
//           };
//       }
//   } catch (error) {
//       console.error('Error fetching user data:', error);
//       return {
//           redirect: {
//               destination: '/login',
//               permanent: false,
//           },
//       };
//   }
// }
