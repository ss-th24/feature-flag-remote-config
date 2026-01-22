// Signup Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Hide previous messages
        errorMessage.classList.remove('show');
        successMessage.classList.remove('show');

        // Get form values
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        try {
            // Call signup API
            const response = await api.post('/auth/users', {
                username,
                password,
                role
            });

            // Show success message
            successMessage.textContent = response.result || 'User created successfully! Redirecting to login...';
            successMessage.classList.add('show');

            // Reset form
            signupForm.reset();

            // Redirect to login page after 2 seconds
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);

        } catch (error) {
            // Show error message
            errorMessage.textContent = error.message || 'An error occurred during signup';
            errorMessage.classList.add('show');
        }
    });
});
