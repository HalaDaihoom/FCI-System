import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import Layout from '../admin-layout'; // Assuming Layout is in the components folder

export default function EditAdmin() {
  const [admin, setAdmin] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatedData, setUpdatedData] = useState({
    first_name: "",
    last_name: "",
    phone_num: "",
    email: "",
    password: "",
    gender: "",
    image: null,
  });
  const [isAdmin, setIsAdmin] = useState(false);

  const router = useRouter();
  const { id } = useParams() || {}; // Handle potential null or undefined value

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/is_admin', {
          withCredentials: true,
        });
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

  useEffect(() => {
    if (id && isAdmin) {
      const fetchAdminDetails = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/admin/${id}`, {
            withCredentials: true,
          });
          if (response.data.success) {
            setAdmin(response.data.admin);
            setUpdatedData({
              first_name: response.data.admin.first_name,
              last_name: response.data.admin.last_name,
              phone_num: response.data.admin.phone_num,
              email: response.data.admin.email,
              gender: response.data.admin.gender,
              image: response.data.admin.image,
            });
          } else {
            setError(response.data.message);
          }
          setLoading(false);
        } catch (err) {
          console.error("Error fetching admin details:", err);
          setError("Failed to load admin details.");
          setLoading(false);
        }
      };

      fetchAdminDetails();
    } else if (!id) {
      router.push('/login');
    }
  }, [id, isAdmin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setUpdatedData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      for (const key in updatedData) {
        formData.append(key, updatedData[key]);
      }

      const response = await axios.put(`http://localhost:3001/edit-admin/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      if (response.data.success) {
        router.push("/admin/admins"); // Redirect back to admins list
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error("Error updating admin:", err);
      setError("Failed to update admin.");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!isAdmin) {
    return <p>Redirecting...</p>; // Provide a visual cue while redirecting
  }

  return (
    <Layout>
      <div style={{ padding: "20px" }}>
        <h1>Edit Admin</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleFormSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <label>First Name</label>
            <input
              type="text"
              name="first_name"
              value={updatedData.first_name}
              onChange={handleInputChange}
              required
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>Last Name</label>
            <input
              type="text"
              name="last_name"
              value={updatedData.last_name}
              onChange={handleInputChange}
              required
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>Phone Number</label>
            <input
              type="text"
              name="phone_num"
              value={updatedData.phone_num}
              onChange={handleInputChange}
              required
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={updatedData.email}
              onChange={handleInputChange}
              required
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={updatedData.password}
              onChange={handleInputChange}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>Gender</label>
            <select
              name="gender"
              value={updatedData.gender}
              onChange={handleInputChange}
              required
              style={{ width: "100%" }}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label>Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ gridColumn: "span 2", textAlign: "center" }}>
            <button type="submit" style={{ backgroundColor: "#007bff", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "5px" }}>
              Update Admin
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
