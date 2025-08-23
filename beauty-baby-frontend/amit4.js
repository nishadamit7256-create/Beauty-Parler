function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
  }
  const tabs = document.querySelectorAll('.tab');
  const items = document.querySelectorAll('.project-item');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      items.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  document.getElementById("contactForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const service = document.getElementById("service").value;
  const message = document.getElementById("message").value;

  try {
    const res = await fetch("http://localhost:5000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, service, message })
    });

    const data = await res.json();
    if (data.success) {
      alert("Your message has been saved ✅");
      document.getElementById("contactForm").reset();
    } else {
      alert("Something Went Wrong ❌");
    }
  } catch (err) {
    console.error(err);
    alert("Error Connecting to Server ❌");
  }
});
