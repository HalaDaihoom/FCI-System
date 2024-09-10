import { useState } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes, FaUser, FaUserGraduate, FaSignOutAlt, FaEnvelope, FaUsers, FaUserShield, FaBook } from 'react-icons/fa';
import { useRouter } from 'next/router';
import axios from 'axios'; // Ensure axios is imported

const Layout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const { pathname } = router;

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {}, { withCredentials: true });
      router.push('/'); 
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getLinkClassName = (route) => {
    return pathname.startsWith(route) ? 'link active' : 'link';
  };

  return (
    <div className="dashboard">
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="logo">
          <h2>Dashboard</h2>
        </div>
        <nav>
          <ul>
            <li>
              <Link href="/admin/admin-profile" passHref>
                <div className={getLinkClassName('/admin/admin-profile')}>
                  <FaUser className="icon" />
                  <span>Profile</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/admin/students" passHref>
                <div className={getLinkClassName('/admin/students')}>
                  <FaUserGraduate className="icon" />
                  <span>Students</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/admin/admins" passHref>
                <div className={getLinkClassName('/admin/admins')}>
                  <FaUserShield className="icon" />
                  <span>Admins</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/admin/search" passHref>
                <div className={getLinkClassName('/admin/search')}>
                  <FaBook className="icon" />
                  <span>Courses</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/admin/send-message" passHref>
                <div className={getLinkClassName('/admin/send-message')}>
                  <FaEnvelope className="icon" />
                  <span>Send Message</span>
                </div>
              </Link>
            </li>
            <li>
              <div
                onClick={handleLogout}
                className="logout"
              >
                <FaSignOutAlt className="icon" />
                <span>Logout</span>
              </div>
            </li>
          </ul>
        </nav>
      </aside>

      <div className="main-content">
        <header>
          <button onClick={toggleSidebar}>
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </header>

        <main>{children}</main>
      </div>

      <style jsx global>{`
        body {
          margin: 0;
        }
      `}</style>

      <style jsx>{`
        .dashboard {
          display: flex;
          height: 100vh;
          margin: 0;
        }

        .sidebar {
          width: 200px;
          background: #535557;
          color: white;
          height: 100%;
          transition: width 0.3s ease;
        }

        .sidebar.open {
          width: 250px;
        }

        .sidebar:not(.open) {
          width: 60px;
        }

        .logo {
          padding: 20px;
          text-align: center;
        }

        nav ul {
          list-style: none;
          padding: 0;
        }

        nav ul li {
          margin: 20px 0;
        }

        .link {
          color: #fff;
          padding: 10px 20px;
          margin: 0 10px;
          font-size: 18px;
          font-weight: bold;
          text-decoration: none !important; // Force remove underline
          transition: color 0.3s;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .link.active {
          color: black; // Highlight color for active page
        }

        .icon {
          margin-right: 10px;
        }

        .logout {
          color: #d9534f; // Logout button color
          cursor: pointer;
          margin: 34px;
          font-weight: bold;
          font-size: larger;
          display: flex;
          align-items: center;
        }

        .main-content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        header {
          background: #535557;
          color: white;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        button {
          background: none;
          border: none;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
        }

        main {
          padding: 20px;
          background: #ecf0f1;
          flex-grow: 1;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default Layout;
