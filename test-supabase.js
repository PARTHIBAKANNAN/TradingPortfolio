// Quick test to verify Supabase connectivity
const supabaseUrl = 'https://euhmeoquktkljpwfcbfl.supabase.co';
const supabaseKey = 'sb_publishable_qEyO55r32cp8fNjtWVfa1w_-xCE5BU0';

console.log('Testing Supabase connectivity...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey);

// Test basic fetch to Supabase
fetch(`${supabaseUrl}/auth/v1/health`, {
  headers: {
    'apikey': supabaseKey,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('✅ Supabase reachable! Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ Response:', data);
})
.catch(error => {
  console.error('❌ Failed to reach Supabase:', error.message);
  console.error('Details:', error);
});

// Alternative test - try to connect with @supabase/supabase-js if available
setTimeout(() => {
  if (typeof window !== 'undefined') {
    console.log('Open browser DevTools Console and paste this code to test...');
  }
}, 1000);
