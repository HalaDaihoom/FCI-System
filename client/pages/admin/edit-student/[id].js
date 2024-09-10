import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Layout from '../admin-layout'; // Assuming Layout is in the components folder

export default function EditStudent() {
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatedData, setUpdatedData] = useState({
    first_name: "",
    last_name: "",
    phone_num: "",
    email: "",
    password: "",
    gender: "",
    level: "",
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
      const fetchStudentDetails = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/student/${id}`, {
            withCredentials: true,
          });
          setStudent(response.data.student);
          setUpdatedData({
            first_name: response.data.student.first_name,
            last_name: response.data.student.last_name,
            phone_num: response.data.student.phone_num,
            email: response.data.student.email,
            gender: response.data.student.gender,
            level: response.data.student.level,
            image: response.data.student.image,
          });
          setLoading(false);
        } catch (err) {
          console.error("Error fetching student details:", err);
          setError("Failed to load student details.");
          setLoading(false);
        }
      };

      fetchStudentDetails();
    } else if (!id) {
      router.push('/login');
    }
  }, [id, isAdmin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleFileChange = (e) => {
  //   setUpdatedData((prev) => ({ ...prev, image: e.target.files[0] }));
  // };

  // const handleFormSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const formData = new FormData();
  //     for (const key in updatedData) {
  //       formData.append(key, updatedData[key]);
  //     }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    // File type validation
    if (file && !file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      setUpdatedData((prev) => ({ ...prev, image: null }));
      return;
    }

    setError(''); // Clear error if file is valid
    setUpdatedData((prev) => ({ ...prev, image: file }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      for (const key in updatedData) {
        if (updatedData[key] !== null) {
          formData.append(key, updatedData[key]);
        }
      }
      
      const response = await axios.put(`http://localhost:3001/edit-student/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      if (response.data.success) {
        router.push("/admin/students"); // Redirect back to students list
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error("Error updating student:", err);
      setError("Failed to update student.");
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
        <h1>Edit Student</h1>
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
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "48%" }}>
              <label>Gender</label>
              <select
                name="gender"
                value={updatedData.gender}
                onChange={handleInputChange}
                style={{ width: "100%" }}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div style={{ width: "48%" }}>
              <label>Level</label>
              <select
                name="level"
                value={updatedData.level}
                onChange={handleInputChange}
                style={{ width: "100%" }}
                required
              >
                <option value="">Select Level</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
          </div>
          {/* <div>
            <label>Image</label>
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              style={{ width: "100%" }}
            />
          </div> */}
          <div className="file-input-container">
            <label>Image</label>
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
            />
            {/* {error && <p className="file-input-error">{error}</p>} */}
          </div>
          <div style={{ gridColumn: "span 2", textAlign: "center" }}>
            <button type="submit" style={{ backgroundColor: "#007bff", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "5px" }}>
              Update Student
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
