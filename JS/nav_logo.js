//NAV_LOGO//

 window.addEventListener('scroll', function () {
    const header = document.getElementById('HEADER');
    const navbarLogo = document.querySelector('.navbar-logo');
    
    if (window.scrollY > header.offsetHeight) {
      navbarLogo.style.display = 'block';
    } else {
      navbarLogo.style.display = 'none';
    }
  });