// Development authentication utility for testing purposes only
// DO NOT use in production

export const bypassAuthForDevelopment = () => {
    // Only run this in development mode
    if (process.env.NODE_ENV !== 'development') return;
    
    // Create a mock JWT token for local testing
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi51c2VyIiwidXNlcm5hbWUiOiJhZG1pbi51c2VyIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGVzIjpbInVzZXIiLCJhZG1pbiJdLCJpYXQiOjE3MTA2NTI4MDAsImV4cCI6MTc0MjE4ODgwMH0.8X5Q8Z9Y2Z9Y2Z9Y2Z9Y2Z9Y2Z9Y2Z9Y2Z9Y2Z9Y2Z9Y';
    
    // Only set if no token exists
    if (!localStorage.getItem('auth_token')) {
        console.log('Setting development auth token for testing');
        localStorage.setItem('auth_token', mockToken);
    }
};