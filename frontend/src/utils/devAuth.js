// Development authentication utility for testing purposes only
// DO NOT use in production

export const bypassAuthForDevelopment = () => {
    // Only run this in development mode
    if (process.env.NODE_ENV !== 'development') return;
    
    // Create a mock JWT token for local testing
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJhZG1pblVzZXIiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZXMiOlsidXNlciIsImFkbWluIl0sImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNjgwODgzNjAwfQ.LUE0VxTMpvwjB3f3ZBKpLDxy4pRlgjIV-iQEJD8JWog';
    
    // Only set if no token exists
    if (!localStorage.getItem('auth_token')) {
      console.log('Setting development auth token for testing');
      localStorage.setItem('auth_token', mockToken);
    }
  };