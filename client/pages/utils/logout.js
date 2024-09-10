// utils/logout.js

export const logout = async () => {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Logout failed');
        }

        // Redirect to the login page
        window.location.href = '/login'; // Adjust if your login page is located elsewhere
    } catch (error) {
        console.error('Error during logout:', error);
    }
};
