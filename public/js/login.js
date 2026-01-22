// Login Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Hide previous messages
        errorMessage.classList.remove('show');

        // Get form values
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        try {
            // Call login API
            const response = await api.post('/auth/login', {
                username,
                password
            });

            // Store token
            if (response.token) {
                api.setToken(response.token);
            }

            // Redirect to employees page
            window.location.href = '/employees.html';

        } catch (error) {
            // Show error message
            errorMessage.textContent = error.message || 'Invalid username or password';
            errorMessage.classList.add('show');
        }
    });
});
