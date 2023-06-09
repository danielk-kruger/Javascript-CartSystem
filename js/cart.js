"use strict";

import { cartItemComponent, productComponent } from "./components.js";
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
const errorMsg = document.getElementById("error-msg");

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

      const filteredProducts =
        category.toLowerCase() === "all"
          ? products
          : products.filter(
              (prod) => prod.category.toLowerCase() === category.toLowerCase()
            );

      return filteredProducts;
    } catch (err) {
      console.error(err);
      return [];
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
    const handleTabClick = (event) => {
      event.preventDefault();

      currentTab.classList.remove("active");
      event.target.classList.add("active");
      currentTab = event.target;

      this.loadProducts(event.target.dataset.category);
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", handleTabClick.bind(this));
    });
  }

  getOrderButtons() {
    buttonsDom = [...document.querySelectorAll(".checkout")];

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
      timeFormat: "HH:mm",
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

    modalClose.addEventListener("click", handleCloseModal);

    function handleCloseModal() {
      sideBarFooter.classList.remove("order-ready");
      modal.classList.add("hidden");
      modalClose.classList.add("hidden");
      finalize.classList.remove("clicked");
      orderBtn.classList.remove("clicked");
      cartSideBar.style.overflowY = "scroll";

      modalClose.removeEventListener("click", handleCloseModal);
    }

    return this;
  }

  parseDialogue() {
    const userNameElem = document.querySelector(".client-name_input");
    const dateElem = document.querySelector(".client-date_input");

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

  orderBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (cart.length < 1) return;

    const dialogue = uiManager.openDialogue();

    finalize.addEventListener("click", (e) => {
      const setOrder = ({ fullName, date }) => {
        let total = 0;
        let orderString = `Ola Elka, queria encomendar:%0A%0A`;

        cart.forEach(({ title, amount, price }, index) => {
          total += amount * price;

          orderString += `Encomenda: ${
            index + 1
          }%0AProduto: ${title}%0AQuantidade: ${amount} dúzias%0APreço: ${price} por dúzia%0A-------------------------------
              `;
        });

        let orderFooter = `
          %0A%0ACliente: ${fullName}%0AData de Levantamento: ${date} %0ATotal a Pagar: ${total}
          `;

        finalize.href = `https://wa.me/258854604410?text=${orderString}${orderFooter}`;
      };

      const user = dialogue.parseDialogue();
      setOrder(user);
    });
  });
});
