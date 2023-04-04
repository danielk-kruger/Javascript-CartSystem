"use strict";

import { cartItemComponent, productComponent } from "./components.js";
import { User } from "./user.js";
import { Storage } from "./storage.js";
import { localePtBr } from "./locale-pt.js";

const cartBtn = document.querySelector(".show-cart");
const gallery = document.querySelector(".gallery");
const closeCartBtn = document.querySelector(".cart-close");
const overlay = document.querySelector(".cart-overlay");
const cartSideBar = document.querySelector(".cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartTotal = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const sideBarFooter = document.querySelector(".cart-footer");
const orderBtn = document.querySelector(".order-btn");
const finalize = document.querySelector(".order-finalize");
const tabs = [...document.querySelectorAll(".tab")];

window.addEventListener("scroll", () => {
  const nav = document.querySelector(".nav");
  const { offsetTop, offsetHeight } = nav;

  window.scrollY > offsetTop + offsetHeight
    ? nav.classList.add("sticky")
    : nav.classList.remove("sticky");
});

const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "zoqrycqrv59z",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "qtkamYoCo1glHu6ig4mq_Q3yk1wqovpXvRwI4EZ7efI",
});

// Cart Items
let cart = [];
let buttonsDom = [];
let currentTab = document.querySelector(".tab.active");

class Products {
  static async getProducts(category) {
    try {
      const { items } = await client.getEntries({
        content_type: "cakeyCakeStoreWebsite",
      });

      const products = items.map(({ fields, sys }) => ({
        title: fields.title,
        price: fields.price,
        isAvailable: fields.isAvailable,
        category: fields.category,
        id: sys.id,
        image: fields.image.fields.file.url,
      }));

      if (category.toLowerCase() === "all") return products;
      return products.filter(
        (prod) => String(prod.category).toLowerCase() === category.toLowerCase()
      );
    } catch (err) {
      console.log(err);
    }
  }
}

class UI {
  products = [];
  total = 0;

  constructor(category) {
    this.loadProducts(category);
    this.setupApp();
  }

  loadProducts(category) {
    Products.getProducts(category)
      .then((res) => {
        this.products = res;
        this.displayProducts(res);
        Storage.saveProducts(res);
      })
      .then(() => {
        this.getOrderButtons();
      });
  }

  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    this.cartLogic();
    this.initDatePicker();
    this.updateCategories();

    cartBtn.addEventListener("click", () => {
      this.checkCart();
      this.showCart();
    });
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  checkCart() {
    const isEmpty = cart.length === 0;
    sideBarFooter.classList.toggle("empty", isEmpty);
    cartContent.classList.toggle("empty-content", isEmpty);
    document.getElementById("empty-msg").classList.toggle("false", isEmpty);
  }

  displayProducts() {
    let components = "";
    this.products.forEach((prod) => (components += productComponent(prod)));
    gallery.innerHTML = components;
  }

  updateCategories() {
    tabs.forEach((tab) => {
      tab.addEventListener("click", (event) => {
        event.preventDefault();

        currentTab.classList.remove("active");
        event.target.classList.add("active");
        currentTab = event.target;

        this.loadProducts(event.target.dataset.category);
      });
    });
  }

  // When Order buttons are clicked send the data to the shopping cart
  getOrderButtons() {
    const btns = [...document.querySelectorAll(".checkout")];
    buttonsDom = btns;

    buttonsDom.forEach((btn) => {
      const { id } = btn.dataset;
      const inCart = cart.find((item) => item.id === id);

      if (inCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }

      btn.addEventListener("click", (e) => {
        e.target.innerText = "In Cart";
        e.target.disabled = true;

        const cartItem = { ...Storage.getProduct(id), amount: 1 };
        cart = [...cart, cartItem];

        Storage.saveCart(cart);
        this.setCartValues(cart);
        this.addCartItem(cartItem);
        this.showCart();
      });
    });
  }

  initDatePicker() {
    new AirDatepicker("#date", {
      inline: false,
      isMobile: true,
      autoClose: true,
      timepicker: true,
      timeFormat: "hh:mm AA",
      locale: localePtBr,
    });
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");

    div.innerHTML = cartItemComponent(item);

    cartContent.appendChild(div);
    this.checkCart();
  }

  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    // cart functionality
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove")) {
        let removeItem = event.target;
        let { id } = removeItem.dataset;
        cartContent.removeChild(removeItem.parentElement);
        this.removeItem(id);
        return;
      }

      let value = event.target;
      const { id } = value.dataset;
      let tempItem = cart.find((item) => item.id === id);
      const valInc = value.classList.contains("fa-chevron-up");

      tempItem.amount += valInc ? 1 : -1;
      if (valInc) value.nextElementSibling.innerText = tempItem.amount;
      else value.previousElementSibling.innerText = tempItem.amount;

      Storage.saveCart(cart);
      this.setCartValues(cart);
      this.checkCart();
    });
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));

    while (cartContent.children.length > 1)
      cartContent.removeChild(cartContent.children[1]);

    this.checkCart();
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    console.log(button);
    button.disabled = false;
    button.innerHTML = `Order <i class="fas fa-shopping-cart"></i>`;
    this.checkCart();
  }

  getSingleButton(id) {
    return buttonsDom.find((button) => button.dataset.id === id);
  }

  populateCart(cart) {
    cart.forEach((item) => item && this.addCartItem(item));
  }

  setCartValues(cart) {
    const tempTotal = cart.reduce(
      (total, item) => total + item.price * item.amount,
      0
    );
    const itemsTotal = cart.reduce((total, item) => total + item.amount, 0);

    this.total = Number(tempTotal.toFixed(2));
    cartTotal.innerText = Number(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  openDialogue() {
    const modal = document.querySelector(".modal");
    const modalClose = document.querySelector(".close");

    sideBarFooter.classList.add("order-ready");
    modal.classList.remove("hidden");
    modalClose.classList.remove("hidden");
    orderBtn.classList.add("clicked");
    finalize.classList.add("clicked");
    cartSideBar.style.overflowY = "hidden";

    modalClose.addEventListener("click", () => {
      sideBarFooter.classList.remove("order-ready");
      modal.classList.add("hidden");
      modalClose.classList.add("hidden");
      finalize.classList.remove("clicked");
      orderBtn.classList.remove("clicked");
      cartSideBar.style.overflowY = "scroll";
    });

    return this;
  }

  parseDialogue() {
    const userNameElem = document.getElementById("name");
    const dateElem = document.getElementById("date");
    const errorMsg = document.getElementById("error-msg");

    // if (userName === "" || date === "") errorMsg.classList.add("hasError");
    // else errorMsg.classList.remove("hasError");

    userNameElem.addEventListener("change", () => {
      if (userNameElem.value === "") errorMsg.classList.add("hasError");
      else errorMsg.classList.remove("hasError");

      dateElem.addEventListener("change", () => {
        if (dateElem.value === "") errorMsg.classList.add("hasError");
        else errorMsg.classList.remove("hasError");
      });
    });

    return { fullName: userNameElem.value, date: dateElem.value };
  }

  setTotal(total) {
    this.total = total;
  }

  getTotal() {
    return this.total;
  }

  hideCart() {
    overlay.classList.remove("show");
    cartSideBar.classList.remove("visible-cart");
    document.body.style.overflow = "auto";
  }

  showCart() {
    overlay.classList.add("show");
    cartSideBar.classList.add("visible-cart");
    document.body.style.overflow = "hidden";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const uiManager = new UI(currentTab.dataset.category);
  // const user = null;

  orderBtn.addEventListener("click", () => {
    if (cart.length >= 1) {
      const dialogue = uiManager.openDialogue();

      const { fullName, date } = dialogue.parseDialogue();
      const user = new User(fullName, date, cart);
      user.collectOrders().collectUserInfo(finalize);
    }
  });
});
