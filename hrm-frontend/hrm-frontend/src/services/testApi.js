import axios from 'axios';

// Test simple de l'API
export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    
    // Test 1: Health check
    const healthResponse = await axios.get('http://localhost:8000/api/v1/health/');
    console.log('Health check:', healthResponse.data);
    
    // Test 2: Login test
    const loginResponse = await axios.post('http://localhost:8000/api/v1/auth/login/', {
      username: 'admin',
      password: 'admin'
    });
    console.log('Login test:', loginResponse.data);
    
    return true;
  } catch (error) {
    console.error('API Test Error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    return false;
  }
};