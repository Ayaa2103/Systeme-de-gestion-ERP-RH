// Script simple pour tester la connectivité API
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Test de base sans authentification
async function testBasicConnection() {
  try {
    console.log('🔍 Test de connexion de base...');
    const response = await axios.get('http://localhost:8000/admin/');
    console.log('✅ Serveur Django accessible');
  } catch (error) {
    console.log('❌ Serveur Django non accessible:', error.message);
    return false;
  }
  return true;
}

// Test avec authentification
async function testWithAuth() {
  try {
    console.log('🔍 Test de login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login/`, {
      username: 'admin',  // Remplacez par vos identifiants
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login réussi, token obtenu');
    
    // Test des endpoints avec token
    const endpoints = [
      '/dashboard/stats/',
      '/dashboard/new-employees-today/',
      '/dashboard/recent-job-offers/'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        console.log(`✅ ${endpoint}:`, response.data);
      } catch (error) {
        console.log(`❌ ${endpoint}:`, error.response?.data || error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Erreur de login:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🚀 Début des tests API...\n');
  
  const serverOk = await testBasicConnection();
  if (serverOk) {
    await testWithAuth();
  }
  
  console.log('\n✨ Tests terminés');
}

runTests();