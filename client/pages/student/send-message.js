import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function SendMessageToAdmin({ onClose }) {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // State for loading indicator
    const router = useRouter();

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/student/profile`, { withCredentials: true });

                if (response.data.success) {
                    setUser(response.data.profile);
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                router.push('/login');
            }
        };

        checkAuthentication();
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Set loading state to true

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/student/send-message`, {
                title,
                message,
            }, { withCredentials: true });

            if (response.status === 200) {
                setStatus('Message sent successfully to the admin!');
            } else {
                setStatus('Failed to send message.');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setStatus('Error sending message. Please try again.');
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            zIndex: 1000,
        }}>
            <div style={{
                backgroundColor: '#fff',
                border: '2px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                width: '100%',
                maxWidth: '500px',
                position: 'relative',
            }}>
                <button 
                    onClick={onClose} 
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#333',
                    }}
                >
                    &times;
                </button>
                <h1 style={{ color: '#333', paddingBottom: '10px' }}>Send Message to Admin</h1>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px', padding: '10px 0' }}>
                        <label htmlFor="title" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Title:</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            style={{
                                width: '96%',
                                padding: '10px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                backgroundColor: '#f9f9f9',
                                color: '#333',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px', padding: '10px 0' }}>
                        <label htmlFor="message" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Message:</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            style={{ 
                                width: '96%', 
                                padding: '10px', 
                                borderRadius: '4px', 
                                border: '1px solid #ccc', 
                                backgroundColor: '#f9f9f9',
                                color: '#333',
                                height: '100px' 
                            }}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading} // Disable button while loading
                        style={{ 
                            marginTop: '10px', 
                            padding: '10px 20px', 
                            borderRadius: '4px', 
                            border: 'none', 
                            backgroundColor: '#007bff', 
                            color: '#fff', 
                            cursor: isLoading ? 'not-allowed' : 'pointer' 
                        }}
                    >
                        {isLoading ? 'loading...' : 'Send Message'} {/* Show loading text */}
                    </button>
                </form>

                {status && <p style={{ marginTop: '10px', color: status.startsWith('Error') ? 'red' : 'green' }}>{status}</p>}
            </div>
        </div>
    );
}





// import { useState } from 'react';
// import axios from 'axios';

// export default function SendMessageToAdmin({ onClose }) {
//     const [title, setTitle] = useState('');
//     const [message, setMessage] = useState('');
//     const [status, setStatus] = useState('');

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         try {
//             const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/student/send_message`, {
//                 title,
//                 message,
//             }, { withCredentials: true });

//             if (response.status === 200) {
//                 setStatus('Message sent successfully to the admin!');
//             } else {
//                 setStatus('Failed to send message.');
//             }
//         } catch (error) {
//             console.error('Error sending message:', error);
//             setStatus('Error sending message. Please try again.');
//         }
//     };

//     return (
//         <div style={{ 
//             position: 'fixed', 
//             top: 0, 
//             left: 0, 
//             width: '100%', 
//             height: '100%', 
//             backgroundColor: 'rgba(0, 0, 0, 0.5)', 
//             display: 'flex', 
//             justifyContent: 'center', 
//             alignItems: 'center',
//             zIndex: 1000,
//         }}>
//             <div style={{
//                 backgroundColor: '#fff',
//                 border: '2px solid #ddd',
//                 borderRadius: '8px',
//                 padding: '20px',
//                 boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
//                 width: '100%',
//                 maxWidth: '500px',
//                 position: 'relative',
//             }}>
//                 <button 
//                     onClick={onClose} 
//                     style={{
//                         position: 'absolute',
//                         top: '10px',
//                         right: '10px',
//                         background: 'transparent',
//                         border: 'none',
//                         fontSize: '24px',
//                         cursor: 'pointer',
//                         color: '#333',
//                     }}
//                 >
//                     &times;
//                 </button>
//                 <h1 style={{ color: '#333', paddingBottom: '10px' }}>Send Message to Admin</h1>
//                 <form onSubmit={handleSubmit}>
//                     <div style={{ marginBottom: '15px', padding: '10px 0' }}>
//                         <label htmlFor="title" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Title:</label>
//                         <input
//                             type="text"
//                             id="title"
//                             value={title}
//                             onChange={(e) => setTitle(e.target.value)}
//                             required
//                             style={{
//                                 width: '96%',
//                                 padding: '10px',
//                                 borderRadius: '4px',
//                                 border: '1px solid #ccc',
//                                 backgroundColor: '#f9f9f9',
//                                 color: '#333',
//                             }}
//                         />
//                     </div>

//                     <div style={{ marginBottom: '15px', padding: '10px 0' }}>
//                         <label htmlFor="message" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Message:</label>
//                         <textarea
//                             id="message"
//                             value={message}
//                             onChange={(e) => setMessage(e.target.value)}
//                             required
//                             style={{ 
//                                 width: '96%', 
//                                 padding: '10px', 
//                                 borderRadius: '4px', 
//                                 border: '1px solid #ccc', 
//                                 backgroundColor: '#f9f9f9',
//                                 color: '#333',
//                                 height: '100px' 
//                             }}
//                         ></textarea>
//                     </div>

//                     <button
//                         type="submit"
//                         style={{ 
//                             marginTop: '10px', 
//                             padding: '10px 20px', 
//                             borderRadius: '4px', 
//                             border: 'none', 
//                             backgroundColor: '#007bff', 
//                             color: '#fff', 
//                             cursor: 'pointer' 
//                         }}
//                     >
//                         Send Message
//                     </button>
//                 </form>

//                 {status && <p style={{ marginTop: '10px', color: status.startsWith('Error') ? 'red' : 'green' }}>{status}</p>}
//             </div>
//         </div>
//     );
// }
