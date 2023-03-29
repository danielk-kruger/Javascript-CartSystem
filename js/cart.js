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

window.addEventListener("scroll", () => {
  const nav = document.querySelector(".nav");
  const content = document.querySelector(".content");

  if (window.scrollY > nav.offsetTop + nav.offsetHeight) {
    nav.classList.add("sticky");
  } else {
    nav.classList.remove("sticky");
  }
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

class Products {
  async getProducts() {
    try {
      const content = await client.getEntries({
        content_type: "cakeyCakeStoreWebsite",
      });

      let products = content.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      // console.log(products);
      return products;
    } catch (err) {
      console.log(err);
    }
  }
}

class UI {
  checkCart() {
    if (cart.length >= 1) {
      sideBarFooter.classList.remove("empty");
      cartContent.classList.remove("empty-content");
      document.getElementById("empty-msg").classList.remove("false");
    } else {
      sideBarFooter.classList.add("empty");
      cartContent.classList.add("empty-content");
      document.getElementById("empty-msg").classList.add("false");
    }
  }

  displayProducts(products) {
    let result = "";
    products.forEach((prod) => {
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
    gallery.innerHTML = result;
  }

  // When Order buttons are clicked send the data to the shopping cart
  getOrderButtons() {
    // Collect all buttons and convert into an array
    let btns = [...document.querySelectorAll(".checkout")];
    buttonsDom = btns;

    buttonsDom.forEach((btn) => {
      const id = btn.dataset.id;

      // create a variable with a high order function to see if the item is inside the cart
      let inCart = cart.find((item) => item.id === id);

      if (inCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }

      btn.addEventListener("click", (e) => {
        e.target.innerText = "In Cart";
        e.target.disabled = true;

        // get the product from storage containing the targeted id and set the quantity to 1
        let cartItem = { ...Storage.getProduct(id), amount: 1 };

        // add product to the cart array
        cart = [...cart, cartItem];

        Storage.saveCart(cart);

        // set the new cart values
        this.setCartValues(cart);

        // display cart item
        // console.log(cartItem[0].title);
        this.addCartItem(cartItem);

        // display the cart item
        this.showCart();
      });
    });
  }

  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
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
        let id = removeItem.dataset.id;
        console.log(removeItem);
        cartContent.removeChild(removeItem.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;

        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }

      // this.checkCart();
    });
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));

    while (cartContent.children.length > 1) {
      cartContent.removeChild(cartContent.children[1]);
      // if (cart.length < 2) break;
    }

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
    cart.forEach((item) => {
      if (item) {
        this.addCartItem(item);
      }
      return;
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;

    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });

    // console.log(parseFloat(tempTotal.toFixed(2)));
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
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
  const ui = new UI();
  const products = new Products();

  ui.setupApp();

  products
    .getProducts()
    .then((product) => {
      ui.displayProducts(product);
      Storage.saveProducts(product);
      // console.log(Storage.getProduct("39yV3WJKg4nEAlmbixMhNY"));
    })
    .then(() => {
      ui.getOrderButtons();
      ui.cartLogic();
      // ui.checkCart();
    });

  cartBtn.addEventListener("click", () => {
    ui.checkCart();
  });
});
