// Simple frontend test that just checks if the application loads
console.log('🧪 Running simple frontend test...');

// Test if we can access the frontend
fetch('/')
  .then(response => {
    if (response.ok) {
      console.log('✅ Frontend is accessible');
      return response.text();
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  })
  .then(html => {
    if (html.includes('Pokedex')) {
      console.log('✅ Frontend contains expected content');
    } else {
      console.log('❌ Frontend content not as expected');
    }
  })
  .catch(error => {
    console.log('❌ Frontend test failed:', error.message);
  });
