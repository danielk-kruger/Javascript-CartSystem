const orderBtn = document.querySelector(".order-btn");

export class User {
  fullName;
  orderDateTime;
  cart;
  total;
  orderString;

  constructor(fullName, orderDateTime, cart) {
    this.fullName = fullName;
    this.orderDateTime = orderDateTime;
    this.cart = cart;
    this.orderString = `Ola Elka, queria encomendar:%0A%0A`;
  }

  collectOrders() {
    // let total = 0;

    this.cart.forEach(({ title, amount, price }, index) => {
      this.total += amount * price;

      this.orderString += `Encomenda: ${
        index + 1
      }%0AProduto: ${title}%0AQuantidade: ${amount} dúzias%0APreço: ${price} por dúzia%0A-------------------------------
        `;
    });

    // return this;
  }

  collectUserInfo() {
    let orderFooter = `
      %0A%0A%0ACliente: ${this.fullName}%0AData do Encomenda: ${this.date} %0ATotal a Pagar: ${this.total}
      `;

    this.orderString += orderFooter;
    return this;
  }

  order() {
    orderBtn.href = `https://wa.me/258854604410?text=${this.orderString}`;
  }

  setFullname(fullname) {
    this.fullname = fullname;
  }

  setOrderDateTime(orderDateTime) {
    this.orderDateTime = orderDateTime;
  }

  getFullName() {
    return this.fullName;
  }

  getOrderDateTime() {
    return this.orderDateTime;
  }
}
