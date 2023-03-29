const mobileMenu = document.querySelector("#mobile-menu");
const navMenu = document.querySelector(".navbar-menu");
const nav = document.querySelector('.navbar');
// const navLink = document.querySelector(".navbar-menu__item-link");

mobileMenu.addEventListener("click", () => {
  mobileMenu.classList.toggle("is-active");
  navMenu.classList.toggle("active");
  // nav.classList.toggle('mobileNav');
});

window.addEventListener("scroll", () => {
  const scrollBtn = document.querySelector(".back-to-top");
  const heroSection = document.querySelector(".landing-card");
  const navBar = document.querySelector(".navbar");

  if (window.scrollY > navBar.offsetTop + navBar.offsetHeight) {
    scrollBtn.classList.add("show");
  } else {
    scrollBtn.classList.remove("show");
  }

  // if (window.scrollY > navBar.offsetTop + navBar.offsetHeight) {
  //   navBar.classList.add("sticky");
  // } else {
  //   navBar.classList.remove("sticky");
  // }
});

// Close mobile menu when clicking nav links

navMenu.addEventListener("click", () => {
  const closeMenuBars = document.querySelector(".is-active");
  if (window.innerWidth <= 820 && closeMenuBars) {
    mobileMenu.classList.toggle("is-active");
    navMenu.classList.remove("active");
  }
});

const landingHeading = document.querySelector(".landing-text__heading");

if (window.innerWidth <= 820) {
  landingHeading.classList.add("mobile");
} else {
  landingHeading.classList.remove("mobile");
}
