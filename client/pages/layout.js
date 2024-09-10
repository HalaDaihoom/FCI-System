import Link from 'next/link';
import { FaUserCircle, FaBell } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const Layout = ({ children, user }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {}, { withCredentials: true });
      router.push('/'); 
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      backgroundColor: '#fff',
      borderBottom: '1px solid #ddd',
    },
    logo: {
      height: '80px',
      width: '150px',
      objectFit: 'contain',
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between', // Distributes space evenly
     // width: '100%', // Ensures the nav spans the full width
      position: 'relative',
    },
    button: {
      color: '#000',
      padding: '10px 20px',
      margin: '0 10px', // Adjust margin for equal spacing
      fontSize: '18px',
      fontWeight: 'bold',
      textDecoration: 'none',
      transition: 'color 0.3s',
      cursor: 'pointer',
    },
    activeButton: {
      color: '#d9534f', // Highlight color for active page
    },
    profileImage: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      objectFit: 'cover',
      cursor: 'pointer',
    },
    icon: {
      fontSize: '24px',
      cursor: 'pointer',
    },
    dropdown: {
      position: 'absolute',
      right: '10px',
      top: '60px', // Adjust based on header height
      backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent white
      border: '1px solid #000', // Light border
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      width: '250px',
      display: isDropdownOpen ? 'block' : 'none',
      zIndex: 1000,
      backdropFilter: 'blur(10px)', // Glassy effect
      margin: "4px",
    },
    dropdownHeader: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.5)', // Light border
      backgroundColor: 'rgba(255, 255, 255, 0.2)', // Slightly more transparent
      fontWeight: 'bold',
      borderRadius: '8px 8px 0 0',
    },
    dropdownContent: {
      padding: '10px',
    },
    dropdownItem: {
      margin: '5px 0',
      fontSize: '14px',
      color: '#333',
    },
    dropdownItemLast: {
      padding: '10px',
      cursor: 'pointer',
      color: '#d9534f', // Change to a logout color
    },
    notificationIcon: {
      fontSize: '24px',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img src="/logo.jpg" alt="Logo" style={styles.logo} />
        <nav style={styles.nav}>
          <Link href="/student/home" passHref>
            <div style={{ ...styles.button, ...(router.pathname === '/student/home' ? styles.activeButton : {}) }}>
              Home
            </div>
          </Link>
          <Link href="/student/courses" passHref>
            <div style={{ ...styles.button, ...(router.pathname === '/student/courses' ? styles.activeButton : {}) }}>
              Courses
            </div>
          </Link>
          <Link href="http://localhost:3000/files/Internal_Regulation_2011.pdf" passHref>
            <div style={{ ...styles.button, ...(router.pathname === 'http://localhost:3000/files/Internal_Regulation_2011.pdf' ? styles.activeButton : {}) }}>
              Regulations
            </div>
          </Link>
          <Link href="/student/receive-notification" passHref>
            <div style={{ ...styles.button, ...(router.pathname === '/student/receive-notification' ? styles.activeButton : {}) }}>
              <FaBell style={styles.notificationIcon} />
            </div>
          </Link>
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div onClick={toggleDropdown} style={styles.profileImage}>
              {user?.image ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${user.image}`}
                  alt="Profile Picture"
                  style={styles.profileImage}
                />
              ) : (
                <FaUserCircle style={styles.icon} />
              )}
            </div>
            <div ref={dropdownRef} style={styles.dropdown}>
              <div style={styles.dropdownHeader}>
                {user?.image ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${user.image}`}
                    alt="Profile Picture"
                    style={{ ...styles.profileImage, width: '100px', height: '100px' }}
                  />
                ) : (
                  <FaUserCircle style={{ ...styles.icon, fontSize: '50px' }} />
                )}
                <div>Hi, {user?.first_name}</div>
              </div>
              <div style={styles.dropdownContent}>
                <div style={styles.dropdownItem}><strong>Name:</strong> {user?.first_name} {user?.last_name}</div>
                <div style={styles.dropdownItem}><strong>Email:</strong> {user?.email}</div>
                {user?.level && <div style={styles.dropdownItem}><strong>Level:</strong> {user?.level}</div>}
                <div style={styles.dropdownItemLast} onClick={handleLogout}><strong>Logout</strong></div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer style={{ textAlign: 'center' }}>
        <p>&copy; 2024 Our College. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
