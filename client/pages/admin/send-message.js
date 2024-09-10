import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router'; // Import useRouter from Next.js
import Layout from './admin-layout'; // Assuming Layout is in the components folder

export default function SendMessage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sendMethod, setSendMethod] = useState('all');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    // Check if the user is an admin
    const checkAdmin = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/is_admin', { withCredentials: true });
        if (!response.data.isAdmin) {
          router.push('/login'); // Redirect to login if not an admin
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/login'); // Redirect to login on error
      }
    };

    checkAdmin();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    try {
      const response = await axios.post('http://localhost:3001/admin/send-message', {
        title,
        message,
        sendMethod,
        recipientEmail: sendMethod === 'one' ? recipientEmail : null, // Only send recipientEmail if sending to one user
      }, { withCredentials: true });

      if (response.status === 200) {
        setStatus('Notification sent successfully!');
      } else {
        setStatus('Failed to send notification.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus('Error sending message. Please try again.');
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <Layout>
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <h1>Send Message</h1>
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px" }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '90%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              style={{ width: '90%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', height: '100px' }}
            ></textarea>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Send to</label>
            <select
              value={sendMethod}
              onChange={(e) => setSendMethod(e.target.value)}
              required
              style={{ width: '92%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="all">All Users</option>
              <option value="one">One User</option>
            </select>
          </div>

          {sendMethod === 'one' && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Recipient Email</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required
                style={{ width: '90%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
          )}

          {/* Status or Loading Message */}
          <div style={{ marginBottom: '15px', textAlign: 'center' }}>
            {isLoading ? (
              <p style={{ color: 'blue' }}></p>
              
            ) : (
              status && <p style={{ color: status.startsWith('Error') ? 'red' : 'green' }}>{status}</p>
            )}
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              type="submit"
              style={{ backgroundColor: "#007bff", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}
              disabled={isLoading} // Disable the button while loading
            >
              {isLoading ? 'loading...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}


// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/router'; // Import useRouter from Next.js
// import Layout from './admin-layout'; // Assuming Layout is in the components folder

// export default function SendMessage() {
//   const [title, setTitle] = useState('');
//   const [message, setMessage] = useState('');
//   const [sendMethod, setSendMethod] = useState('all');
//   const [recipientEmail, setRecipientEmail] = useState('');
//   const [status, setStatus] = useState('');
//   const router = useRouter(); // Initialize useRouter

//   useEffect(() => {
//     // Check if the user is an admin
//     const checkAdmin = async () => {
//       try {
//         const response = await axios.get('http://localhost:3001/api/is_admin', { withCredentials: true });
//         if (!response.data.isAdmin) {
//           router.push('/login'); // Redirect to login if not an admin
//         }
//       } catch (error) {
//         console.error('Error checking admin status:', error);
//         router.push('/login'); // Redirect to login on error
//       }
//     };

//     checkAdmin();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await axios.post('http://localhost:3001/admin/send-message', {
//         title,
//         message,
//         sendMethod,
//         recipientEmail: sendMethod === 'one' ? recipientEmail : null, // Only send recipientEmail if sending to one user
//       }, { withCredentials: true });

//       if (response.status === 200) {
//         setStatus('Notification sent successfully!');
//       } else {
//         setStatus('Failed to send notification.');
//       }
//     } catch (error) {
//       console.error('Error sending message:', error);
//       setStatus('Error sending message. Please try again.');
//     }
//   };

//   return (
//     <Layout>
//       <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
//         <h1>Send Message</h1>
//         <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px" }}>
//           <div style={{ marginBottom: '15px' }}>
//             <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title</label>
//             <input
//               type="text"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               required
//               style={{ width: '90%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
//             />
//           </div>

//           <div style={{ marginBottom: '15px' }}>
//             <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Message</label>
//             <textarea
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               required
//               style={{ width: '90%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', height: '100px' }}
//             ></textarea>
//           </div>

//           <div style={{ marginBottom: '15px' }}>
//             <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Send to</label>
//             <select
//               value={sendMethod}
//               onChange={(e) => setSendMethod(e.target.value)}
//               required
//               style={{ width: '92%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
//             >
//               <option value="all">All Users</option>
//               <option value="one">One User</option>
//             </select>
//           </div>

//           {sendMethod === 'one' && (
//             <div style={{ marginBottom: '15px' }}>
//               <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Recipient Email</label>
//               <input
//                 type="email"
//                 value={recipientEmail}
//                 onChange={(e) => setRecipientEmail(e.target.value)}
//                 required
//                 style={{ width: '90%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
//               />
//             </div>
//           )}

//           {/* Status message positioned after form fields but before submit button */}
//           {status && (
//             <div style={{ marginBottom: '15px', textAlign: 'center' }}>
//               <p style={{ color: status.startsWith('Error') ? 'red' : 'green' }}>{status}</p>
//             </div>
//           )}

//           <div style={{ textAlign: "center" }}>
//             <button
//               type="submit"
//               style={{ backgroundColor: "#007bff", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}
//             >
//               Send Message
//             </button>
//           </div>
//         </form>
//       </div>
//     </Layout>
//   );
// }
