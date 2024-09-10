"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Layout from './admin-layout'; // Assuming Layout is in the components folder

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:3001/admin/admin-profile', {
          withCredentials: true
        });

        if (response.data.success) {
          setProfile(response.data.profile);
        } else {
          setError(response.data.message || "Failed to load profile.");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);

        if (err.response) {
          if (err.response.status === 401) {
            router.push('/login');
          } else if (err.response.status === 403) {
            setError("You do not have permission to view this profile.");
          } else if (err.response.status === 404) {
            setError("Profile not found.");
          } else {
            setError("Failed to load profile. Please try again later.");
          }
        } else {
          setError("Failed to load profile. Please try again later.");
        }
      }
    };
    fetchProfile();
  }, [router]);

  return (
    <Layout>
      <div className="profile-container">
  <h1>Admin Profile</h1>
  {error && <p className="error-message">{error}</p>}
  {profile ? (
    <div className="profile-card">
      <div className="profile-image-container">
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${profile.image}`}
          alt="Profile Picture"
          className="profile-image"
        />
      </div>
      <div className="profile-info-container">
        <div className="profile-info">
          <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone_num}</p>
          <p><strong>Gender:</strong> {profile.gender}</p>
        </div>
      </div>
    </div>
  ) : (
    <p>Loading...</p>
  )}
</div>
<style jsx>{`
    .profile-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .profile-card {
      display: flex;
      align-items: center;
      gap: 20px;
      width: 100%;
      max-width: 800px;
    }

    .profile-image-container {
      flex: 1;
    }

    .profile-image {
      border-radius: 50%;
      width: 200px;
      height: 200px;
      object-fit: cover;
      margin-bottom: 15px;
    }

    .profile-info-container {
      flex: 2;
    }

    .profile-info p {
      margin: 10px 0;
    }

    .error-message {
      color: red;
      text-align: center;
    }
  `}</style>

    </Layout>
  );
}
