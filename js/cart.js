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

  constructor(category) {
    this.setupApp();
    this.loadProducts(category);

    // console.log(this.products);
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
        this.cartLogic();
      });
  }

  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
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
    let result = "";
    // this.products = products;

    this.products.forEach((prod) => {
      result += `
        <div class="gallery-pic">
          <p>${prod.title}</p>
          <span>${prod.price}Mt</span>
          <img
            src=${prod.image}
          />
          <button class="checkout" data-id=${prod.id}>
            Order <i class="fas fa-shopping-cart"></i>
          </button>
        </div>
      `;
    });
    // Storage.saveProducts(this.products);
    gallery.innerHTML = result;
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
        console.log(e.target);

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
    });
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");

    div.innerHTML = `
      <img
        src=${item.image}
        alt=""
      />
      <div class='wrapper'>
        <div>
          <h4>${item.title}</h4>
        <h5 class='mobile'>MT ${item.price}</h5>
      </div>
      <div class='cotrls'>
        <h5>MT ${item.price}</h5>
        <div class='cotrls-amounts'>
          <i class="fas fa-chevron-up" data-id=${item.id}></i>
          <p class="item-amount">${item.amount}</p>
          <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>
      </div>
      </div>
      <a href="#" class="remove-item remove" data-id=${item.id}><i class="fas fa-times-circle"></i></a>
    `;

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

    cartTotal.innerText = Number(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
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

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new UI(currentTab.dataset.category);

  orderBtn.addEventListener("click", () => {
    const setOrder = () => {
      let order = `Ola Elka, queria encomendar:%0A%0A`;
      let total = 0;

      cart.forEach(({ title, amount, price }, index) => {
        total += amount * price;

        order += `Encomenda: ${
          index + 1
        }%0AProduto: ${title}%0AQuantidade: ${amount} dúzias%0APreço: ${price} por dúzia%0A-------------------------------
        `;
      });
      let orderFooter = `
      %0A%0A%0AData do Encomenda: %0ATotal a Pagar: ${total}
      `;

      // console.log(order);
      orderBtn.href = `https://wa.me/258854604410?text=${order}${orderFooter}`;
    };

    if (cart.length >= 1) setOrder();
  });
});
