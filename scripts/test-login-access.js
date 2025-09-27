const axios = require('axios');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

// Create a cookie jar
const jar = new tough.CookieJar();
const client = wrapper(axios.create({ jar }));

async function testLoginAndPageAccess() {
  try {
    console.log('Testing login and page access...');

    // First, try to login as 'mew'
    console.log('Attempting login as user: mew');
    const loginResponse = await client.post('http://localhost:3000/login', {
      username: 'mew',
      password: 'test123' // You'll need to use the actual password
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept redirects
      }
    });

    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', loginResponse.headers);

    // Check if login was successful by looking at redirect
    if (loginResponse.status === 302 && loginResponse.headers.location) {
      console.log('Login redirect to:', loginResponse.headers.location);
    }

    // Now try to access the Welcome page
    console.log('Attempting to access Welcome page...');
    const pageResponse = await client.get('http://localhost:3000/view/Welcome');

    console.log('Page access status:', pageResponse.status);
    console.log('Page response length:', pageResponse.data.length);

    if (pageResponse.status === 200) {
      console.log('SUCCESS: Page access granted');
    } else if (pageResponse.status === 403) {
      console.log('FAILED: Access denied');
      console.log('Response data:', pageResponse.data);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testLoginAndPageAccess();