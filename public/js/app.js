document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('vote-form');
    const message = document.getElementById('message');
  
    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
  
        const formData = new FormData(form);
        const response = await fetch('/vote', {
          method: 'POST',
          body: new URLSearchParams(formData),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
  
        if (response.ok) {
          message.textContent = await response.text();
        } else {
          message.textContent = await response.text();
        }
      });
    }
  });
  
console.log("first")