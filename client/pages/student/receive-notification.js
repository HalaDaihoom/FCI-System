import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../layout';
import SendMessageToAdmin from './send-message';

const styles = {
    mainContainer: {
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        maxWidth: '800px',
        margin: 'auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    title: {
        margin: 0,
        fontSize: '24px',
        color: '#333',
    },
    connectButton: {
        padding: '10px 15px',
        cursor: 'pointer',
        backgroundColor: '#0c6fe5',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '14px',
        transition: 'background-color 0.3s',
    },
    notificationList: {
        listStyleType: 'none',
        padding: 0,
    },
    notificationItem: {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9',
        transition: 'box-shadow 0.3s',
    },
    notificationMeta: {
        display: 'block',
        marginBottom: '5px',
        color: '#666',
        fontSize: '12px',
    },
    notificationTitle: {
        margin: '0 0 10px 0',
        fontSize: '18px',
        color: '#0c6fe5',
    },
    notificationContent: {
        margin: 0,
        color: '#333',
    },
};

export default function ReceiveNotification({ user }) {
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSendMessage, setShowSendMessage] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/student/receive-notifications`, { withCredentials: true });
                // Sort notifications by send_at in descending order
                const sortedNotifications = response.data.sort((a, b) => new Date(b.send_at) - new Date(a.send_at));
                setNotifications(sortedNotifications);
            } catch (error) {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    router.push('/login');
                } else {
                    console.error("Error fetching notifications:", error);
                    setError(error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [router]);

    const handleAdminConnect = () => {
        setShowSendMessage(true);
    };

    const handleCloseSendMessage = () => {
        setShowSendMessage(false);
    };

    if (loading) return <div style={styles.mainContainer}>Loading...</div>;
    if (error) return <div style={styles.mainContainer}>Error fetching notifications: {error.message}</div>;

    return (
        <Layout user={user}>
            <main style={styles.mainContainer}>
                {showSendMessage ? (
                    <SendMessageToAdmin onClose={handleCloseSendMessage} />
                ) : (
                    <>
                        <div style={styles.header}>
                            <h1 style={styles.title}>Notifications</h1>
                            <button 
                                style={styles.connectButton}
                                onClick={handleAdminConnect}
                            >
                                contact with Admin
                            </button>
                        </div>

                        {notifications.length === 0 ? (
                            <h2>No notifications found.</h2>
                        ) : (
                            <ul style={styles.notificationList}>
                                {notifications.map(notification => (
                                    <li key={notification.receive_notification_id} style={styles.notificationItem}>
                                        <small style={styles.notificationMeta}>
                                            <strong>Sent at:</strong> {new Date(notification.send_at).toLocaleString()}
                                        </small>
                                        <h2 style={styles.notificationTitle}>
                                            <strong>Title:</strong> {notification.title}
                                        </h2>
                                        <p style={styles.notificationContent}>
                                            <strong>Message:</strong> {notification.content}
                                        </p>
                                        <p><strong style={{color:"blue"}}>From : </strong> FCI Admin </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </main>
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
