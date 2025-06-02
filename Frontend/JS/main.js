const openMenuBtn = document.querySelector('#open-menu-btn');
const closeMenuBtn = document.querySelector('#close-menu-btn');

openMenuBtn.addEventListener('click', () => {
  document.querySelector('.mobile-menu').style.display = 'block';
});

closeMenuBtn.addEventListener('click', () => {
  document.querySelector('.mobile-menu').style.display = 'none';
});
