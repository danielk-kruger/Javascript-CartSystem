const orderBtn = document.querySelector(".order-btn");

export class User {
  fullName;
  orderDateTime;
  orderString;

  constructor(fullName, orderDateTime) {
    this.fullName = fullName;
    this.orderDateTime = orderDateTime;
    this.orderString = `Ola Elka, queria encomendar:%0A%0A`;
  }

  collectOrders(cart) {
    let total = 0;

    cart.forEach(({ title, amount, price }, index) => {
      total += amount * price;

      this.orderString += `Encomenda: ${
        index + 1
      }%0AProduto: ${title}%0AQuantidade: ${amount} dúzias%0APreço: ${price} por dúzia%0A-------------------------------
        `;
    });
    let orderFooter = `
      %0A%0A%0AData do Encomenda: %0ATotal a Pagar: ${total}
      `;
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
