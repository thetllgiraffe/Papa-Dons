 const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('bar');

    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });