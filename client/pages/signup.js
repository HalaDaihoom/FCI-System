import { useState } from 'react';
import { useRouter } from 'next/router';

export default function IndexPage() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone_num: '',
        email: '',
        password: '',
        confirmPassword: '',
        level: '',
        gender: '',
        role: 'student', // Set role to "student" by default
        image: null,
    });
    const [errors, setErrors] = useState({});
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            const file = files[0];
            if (file && !file.type.startsWith('image/')) {
                setErrors({ ...errors, image: 'Please upload a valid image file' });
            } else {
                setErrors({ ...errors, image: null });
                setFormData({ ...formData, image: file });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const validate = () => {
        let errors = {};
        if (!formData.first_name) errors.first_name = 'First Name is required';
        if (!formData.last_name) errors.last_name = 'Last Name is required';
        if (!formData.phone_num) errors.phone_num = 'Phone number is required';
        if (!formData.email) errors.email = 'Email is required';
        if (!formData.password) errors.password = 'Password is required';
        if (!formData.confirmPassword) errors.confirmPassword = 'Confirm Password is required';
        if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
        if (!formData.level) errors.level = 'Level is required';
        if (!formData.gender) errors.gender = 'Gender is required';

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.image && !formData.image.type.startsWith('image/')) {
            setErrors({ ...errors, image: 'Please upload a valid image file' });
            return;
        }

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const form = new FormData();
        for (const key in formData) {
            form.append(key, formData[key]);
        }

        try {
            const res = await fetch('http://localhost:3001/signup', {
                method: 'POST',
                body: form,
            });

            const contentType = res.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                const data = await res.json();
                if (res.ok) {
                    console.log('Signup successful!');
                    router.push('/login');
                } else {
                    setErrors(data);
                }
            } else {
                console.error('Unexpected response format');
            }
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    };

    return (
        <div>
            <style jsx global>{`
                body {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
            `}</style>
            
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    backgroundImage: "url('/5940678393530008176.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <div
                    style={{
                        padding: "20px",
                        borderRadius: "16px",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.6)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        width: "600px",
                        maxWidth: "100%",
                    }}
                >
                    <h1 style={{ textAlign: "center", color: "black", fontWeight: "bold", fontSize: "25px", marginBottom: "5px" }}>Sign Up</h1>
                    <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
                        
                        {/* First Name */}
                        <div style={{ flex: "1 0 48%" }}>
                            <input
                                type="text"
                                name="first_name"
                                placeholder="First Name"
                                value={formData.first_name}
                                onChange={handleChange}
                                style={{
                                    padding: "10px",
                                    width: "90%",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                }}
                            />
                            {errors.first_name && <p style={{ color: 'red' }}>{errors.first_name}</p>}
                        </div>
                        
                        {/* Last Name */}
                        <div style={{ flex: "1 0 48%" }}>
                            <input
                                type="text"
                                name="last_name"
                                placeholder="Last Name"
                                value={formData.last_name}
                                onChange={handleChange}
                                style={{
                                    padding: "10px",
                                    width: "90%",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                }}
                            />
                            {errors.last_name && <p style={{ color: 'red' }}>{errors.last_name}</p>}
                        </div>

                        {/* Phone Number */}
                        <div style={{ flex: "1 0 48%" }}>
                            <input
                                type="text"
                                name="phone_num"
                                placeholder="Phone Number"
                                value={formData.phone_num}
                                onChange={handleChange}
                                style={{
                                    padding: "10px",
                                    width: "90%",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                }}
                            />
                            {errors.phone_num && <p style={{ color: 'red' }}>{errors.phone_num}</p>}
                        </div>
                        
                        {/* Email */}
                        <div style={{ flex: "1 0 48%" }}>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                style={{
                                    padding: "10px",
                                    width: "90%",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                }}
                            />
                            {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
                        </div>
                        
                        {/* Password */}
                        <div style={{ flex: "1 0 48%" }}>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                style={{
                                    padding: "10px",
                                    width: "90%",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                }}
                            />
                            {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
                        </div>
                        
                        {/* Confirm Password */}
                        <div style={{ flex: "1 0 48%" }}>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                style={{
                                    padding: "10px",
                                    width: "90%",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                }}
                            />
                            {errors.confirmPassword && <p style={{ color: 'red' }}>{errors.confirmPassword}</p>}
                        </div>
                        
                        {/* Gender */}
                        <div style={{ flex: "1 0 48%" }}>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                style={{
                                    padding: "10px",
                                    width: "90%",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                }}
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                            {errors.gender && <p style={{ color: 'red' }}>{errors.gender}</p>}
                        </div>

                        {/* Level */}
                        <div style={{ flex: "1 0 48%" }}>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                style={{
                                    padding: "10px",
                                    width: "90%",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                }}
                            >
                                <option value="">Select Your Level</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                            {errors.level && <p style={{ color: 'red' }}>{errors.level}</p>}
                        </div>
                        
                        {/* Image */}
                        <div style={{ flex: "1 0 48%" }}>
                            <input
                                type="file"
                                name="image"
                                onChange={handleChange}
                                style={{
                                    padding: "10px",
                                    width: "90%",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                }}
                            />
                            {errors.image && <p style={{ color: 'red' }}>{errors.image}</p>}
                        </div>
                        
                        <div style={{ width: "100%", textAlign: "center" }}>
                            <button
                                type="submit"
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#0070f3",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                Sign Up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}


// import { useState } from 'react';
// import { useRouter } from 'next/router';

// export default function IndexPage() {
//     const [formData, setFormData] = useState({
//         first_name: '',
//         last_name: '',
//         phone_num: '',
//         email: '',
//         password: '',
//         confirmPassword: '',
//         level: '',
//         gender: '',
//         role: '',
//         image: null,
//     });
//     const [errors, setErrors] = useState({});
//     const router = useRouter();

//     const handleChange = (e) => {
//         const { name, value, files } = e.target;
//         if (name === 'image') {
//             const file = files[0];
//             if (file && !file.type.startsWith('image/')) {
//                 setErrors({ ...errors, image: 'Please upload a valid image file' });
//             } else {
//                 setErrors({ ...errors, image: null });
//                 setFormData({ ...formData, image: file });
//             }
//         } else {
//             setFormData({ ...formData, [name]: value });
//         }
//     };
//     const validate = () => {
//         let errors = {};
//         if (!formData.first_name) errors.first_name = 'First Name is required';
//         if (!formData.last_name) errors.last_name = 'Last Name is required';
//         if (!formData.phone_num) errors.phone_num = 'Phone number is required';
//         if (!formData.email) errors.email = 'Email is required';
//         if (!formData.password) errors.password = 'Password is required';
//         if (!formData.confirmPassword) errors.confirmPassword = 'Confirm Password is required';
//         if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
//         if (!formData.level) errors.level = 'Level is required';
//         if (!formData.gender) errors.gender = 'Gender is required';
//         if (!formData.role) errors.role = 'Role is required';

//         return errors;
//     };
//     const handleSubmit = async (e) => {
//         e.preventDefault();
    
//         if (formData.image && !formData.image.type.startsWith('image/')) {
//             setErrors({ ...errors, image: 'Please upload a valid image file' });
//             return;
//         }
    
//         const validationErrors = validate();
//         if (Object.keys(validationErrors).length > 0) {
//             setErrors(validationErrors);
//             return;
//         }
    
//         const form = new FormData();
//         for (const key in formData) {
//             form.append(key, formData[key]);
//         }
    
//         try {
//             const res = await fetch('http://localhost:3001/signup', {
//                 method: 'POST',
//                 body: form,
//             });
    
//             const contentType = res.headers.get('content-type');
    
//             if (contentType && contentType.includes('application/json')) {
//                 const data = await res.json();
//                 if (res.ok) {
//                     console.log('Signup successful!');
//                     router.push('/login');
//                 } else {
//                     setErrors(data);
//                 }
//             } else {
//                 console.error('Unexpected response format');
//             }
//         } catch (error) {
//             console.error('Fetch Error:', error);
//             // Additional logging or user feedback
//         }
//     };



//     return (
//         <div>
//             <style jsx global>{`
//                 body {
//                     margin: 0;
//                     padding: 0;
//                     box-sizing: border-box;
//                 }
//             `}</style>
            
//         <div
//             style={{
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 height: "100vh",
//                 backgroundImage: "url('/5940678393530008176.jpg')",
//                 backgroundSize: "cover",
//                 backgroundPosition: "center",
//                 backgroundRepeat: "no-repeat",
//             }}
//         >
//             <div
//                 style={{
//                     padding: "20px",
//                     borderRadius: "16px",
//                     backgroundColor: "rgba(255, 255, 255, 0.1)",
//                     boxShadow: "0 4px 30px rgba(0, 0, 0, 0.6)",
//                     backdropFilter: "blur(10px)",
//                     WebkitBackdropFilter: "blur(10px)",
//                     border: "1px solid rgba(255, 255, 255, 0.3)",
//                     width: "600px", // Increased width
//                     maxWidth: "100%",
//                 }}
//             >
//                 <h1 style={{ textAlign: "center", color: "black", fontWeight: "bold", fontSize: "25px",marginbottom: "5px" }}>Sign Up</h1>
//                 <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
                    
//                     {/* First Name and Last Name on the same line */}
//                     <div style={{ flex: "1 0 48%" }}>
//                         <input
//                             type="text"
//                             name="first_name"
//                             placeholder="First Name"
//                             value={formData.first_name}
//                             onChange={handleChange}
//                             style={{
//                                 padding: "10px",
//                                 width: "90%",
//                                 border: "1px solid #ccc",
//                                 borderRadius: "4px",
//                             }}
//                         />
//                         {errors.first_name && <p style={{ color: 'red' }}>{errors.first_name}</p>}
//                     </div>
                    
//                     <div style={{ flex: "1 0 48%" }}>
//                         <input
//                             type="text"
//                             name="last_name"
//                             placeholder="Last Name"
//                             value={formData.last_name}
//                             onChange={handleChange}
//                             style={{
//                                 padding: "10px",
//                                 width: "90%",
//                                 border: "1px solid #ccc",
//                                 borderRadius: "4px",
//                             }}
//                         />
//                         {errors.last_name && <p style={{ color: 'red' }}>{errors.last_name}</p>}
//                     </div>

//                     {/* Phone Number and Email on the same line */}
//                     <div style={{ flex: "1 0 48%" }}>
//                         <input
//                             type="text"
//                             name="phone_num"
//                             placeholder="Phone Number"
//                             value={formData.phone_num}
//                             onChange={handleChange}
//                             style={{
//                                 padding: "10px",
//                                 width: "90%",
//                                 border: "1px solid #ccc",
//                                 borderRadius: "4px",
//                             }}
//                         />
//                         {errors.phone_num && <p style={{ color: 'red' }}>{errors.phone_num}</p>}
//                     </div>
                    
//                     <div style={{ flex: "1 0 48%" }}>
//                         <input
//                             type="email"
//                             name="email"
//                             placeholder="Email"
//                             value={formData.email}
//                             onChange={handleChange}
//                             style={{
//                                 padding: "10px",
//                                 width: "90%",
//                                 border: "1px solid #ccc",
//                                 borderRadius: "4px",
//                             }}
//                         />
//                         {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
//                     </div>
                    
//                     {/* Password and Confirm Password on the same line */}
//                     <div style={{ flex: "1 0 48%" }}>
//                         <input
//                             type="password"
//                             name="password"
//                             placeholder="Password"
//                             value={formData.password}
//                             onChange={handleChange}
//                             style={{
//                                 padding: "10px",
//                                 width: "90%",
//                                 border: "1px solid #ccc",
//                                 borderRadius: "4px",
//                             }}
//                         />
//                         {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
//                     </div>
                    
//                     <div style={{ flex: "1 0 48%" }}>
//                         <input
//                             type="password"
//                             name="confirmPassword"
//                             placeholder="Confirm Password"
//                             value={formData.confirmPassword}
//                             onChange={handleChange}
//                             style={{
//                                 padding: "10px",
//                                 width: "90%",
//                                 border: "1px solid #ccc",
//                                 borderRadius: "4px",
//                             }}
//                         />
//                         {errors.confirmPassword && <p style={{ color: 'red' }}>{errors.confirmPassword}</p>}
//                     </div>
                    
//                     {/* Gender and Role on the same line */}
//                     <div style={{ flex: "1 0 48%" }}>
//                         <select
//                             name="gender"
//                             value={formData.gender}
//                             onChange={handleChange}
//                             style={{
//                                 padding: "10px",
//                                 width: "90%",
//                                 border: "1px solid #ccc",
//                                 borderRadius: "4px",
//                             }}
//                         >
//                             <option value="">Select Gender</option>
//                             <option value="male">Male</option>
//                             <option value="female">Female</option>
//                         </select>
//                         {errors.gender && <p style={{ color: 'red' }}>{errors.gender}</p>}
//                     </div>

//                     <div style={{ flex: "1 0 48%" }}>
//                         <select
//                             name="role"
//                             value={formData.role}
//                             onChange={handleChange}
//                             style={{
//                                 padding: "10px",
//                                 width: "90%",
//                                 border: "1px solid #ccc",
//                                 borderRadius: "4px",
//                             }}
//                         >
//                             <option value="">Select Role</option>
//                             <option value="student">Student</option>
//                         </select>
//                         {errors.role && <p style={{ color: 'red' }}>{errors.role}</p>}
//                     </div>

//                     {formData.role === 'student' && (
//                         <div style={{ flex: "1 0 48%" }}>
//                             <select
//                                 name="level"
//                                 value={formData.level}
//                                 onChange={handleChange}
//                                 style={{
//                                     padding: "10px",
//                                     width: "90%",
//                                     border: "1px solid #ccc",
//                                     borderRadius: "4px",
//                                 }}
//                             >
//                                 <option value="">Select Your Level</option>
//                                 <option value="1">1</option>
//                                 <option value="2">2</option>
//                                 <option value="3">3</option>
//                                 <option value="4">4</option>
//                             </select>
//                             {errors.level && <p style={{ color: 'red' }}>{errors.level}</p>}
//                         </div>
//                     )}

                  
// <div style={{ flex: "1 0 100%", marginTop: "10px" }}>
//                         <input
//                             type="file"
//                             name="image"
//                             onChange={handleChange}
//                             style={{
//                                 padding: "10px",
//                                 width: "90%",
//                                 border: "1px solid #ccc",
//                                 borderRadius: "4px",
//                             }}
//                         />
//                         {errors.image && <p style={{ color: 'red' }}>{errors.image}</p>}
//                     </div>

                    
//                     <button
//                         type="submit"
//                         style={{
//                             padding: "10px",
//                             marginTop: "10px",
//                             border: "none",
//                             borderRadius: "4px",
//                             backgroundColor: "#000c19",
//                             color: "#fff",
//                             cursor: "pointer",
//                             width: "100%",
//                         }}
//                     >
//                         Sign Up
//                     </button>
//                 </form>
//             </div>
//         </div>
//         </div>
//     );
// }


