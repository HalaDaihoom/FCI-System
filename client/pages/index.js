import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
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
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '2px solid #ddd',
    },
    logo: {
      height: '80px',
      width: '150px',
      objectFit: 'contain',
    },
    nav: {
      display: 'flex',
    },
    button: {
      color: '#000',
      padding: '10px 20px',
      margin: '0 5px',
      cursor: 'pointer',
      fontSize: '18px',
      fontWeight: 'bold',
      transition: 'color 0.3s ease',
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
    <div style={styles.container}>
      <header style={styles.header}>
        <img src="/logo.jpg" alt="Logo" style={styles.logo} />
        <nav style={styles.nav}>
          {['Home', 'Login', 'Sign Up'].map((item, index) => (
            <Link key={index} href={index === 0 ? "/" : `/${item.toLowerCase().replace(' ', '')}`} passHref>
              <div style={styles.button}>{item}</div>
            </Link>
          ))}
        </nav>
      </header>

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
            <h1>About the College</h1>
            <p>
          
          The Faculty of Computer and Information (FCI) at Assuit University offers a diverse range of programs designed to equip students with the skills necessary to excel in the rapidly evolving field of technology. The college is home to four major departments: Computer Science (CS), Information Systems (IS), Information Technology (IT), and Multimedia. The Computer Science department focuses on developing students' abilities in software development, algorithms, and computational theory. The Information Systems department integrates business principles with technology, preparing students to design and manage complex information systems. The Information Technology department emphasizes the practical application of technology solutions, covering network administration, system security, and cloud computing.
           Finally, the Multimedia department offers students creative and technical skills in digital media, including animation, video production, and graphic design.
            </p>
          </div>
        </section>

        <div style={styles.sectionSeparator}></div>

        <section style={styles.twoColumnSection}>
          <div style={styles.textContainer}>
            <h1>About the Staff</h1>
            <p>
            The Faculty of Computer and Information at Assuit University is led by the esteemed Dean, Prof. Dr. Taiseer Hassan Abdel-Hamid Sulaiman. As the Dean of the Faculty, Prof. Dr. Sulaiman brings a wealth of academic and administrative experience to the role, guiding the faculty in academic excellence and innovation. Under her leadership, the faculty boasts a team of highly qualified professors, each an expert in their respective fields, who are dedicated to providing students with a high-quality education. These professors are involved in groundbreaking research and bring the latest industry knowledge into the classroom, ensuring that students are well-prepared for their future careers.

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
            <h1>About the Website</h1>
            <p>
            
            The FCI Assuit University website aims to enhance the educational experience by providing a comprehensive online platform for students and faculty members. The primary goal is to facilitate efficient communication and information sharing within the college community. Students can use the website to receive timely notifications about updates, deadlines, and events, access course materials, view schedules, and track grades. Additionally, the website features a contact form, allowing students to communicate directly with administrators and receive responses to their inquiries. Administrators can manage student and course information, send alerts, and maintain internal regulations. By offering these functionalities, the website strives to reduce confusion, ensure easy access to essential information, and support the academic and administrative needs of the Faculty of Computer and Information​(requirements).

            </p>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <p>&copy; 2024 Our College. All rights reserved.</p>
      </footer>
    </div>
  );
}
