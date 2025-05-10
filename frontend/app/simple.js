// Simple script to redirect to backend API
document.addEventListener('DOMContentLoaded', function() {
  const backendUrl = 'https://portfolio-backend-824962762241.us-central1.run.app';
  
  // Display backend URL
  const backendUrlElement = document.getElementById('backend-url');
  if (backendUrlElement) {
    backendUrlElement.textContent = backendUrl;
    backendUrlElement.href = backendUrl;
  }
  
  // Add button functionality
  const goToBackendBtn = document.getElementById('go-to-backend');
  if (goToBackendBtn) {
    goToBackendBtn.addEventListener('click', function() {
      window.location.href = backendUrl;
    });
  }
  
  // Fetch backend status
  fetch(backendUrl + '/status')
    .then(response => response.json())
    .then(data => {
      const statusElement = document.getElementById('backend-status');
      if (statusElement) {
        statusElement.textContent = 'Backend Status: ' + (data.status || 'Unknown');
      }
    })
    .catch(error => {
      console.error('Error fetching backend status:', error);
      const statusElement = document.getElementById('backend-status');
      if (statusElement) {
        statusElement.textContent = 'Backend Status: Error - Unable to connect';
      }
    });
}); 