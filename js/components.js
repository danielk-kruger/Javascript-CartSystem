export const productComponent = (product) => {
  return `
    <div class="gallery-pic">
      <p>${product.title}</p>
      <span>${product.price}Mt</span>
      <img
        src=${product.image}
      />
      <button class="checkout" data-id=${product.id}>
        Order <i class="fas fa-shopping-cart"></i>
      </button>
    </div>
  `;
};

export const cartItemComponent = (cartItem) => {
  return `
    <img
      src=${cartItem.image}
      alt=""
    />
    <div class='wrapper'>
      <div>
        <h4>${cartItem.title}</h4>
      <h5 class='mobile'>MT ${cartItem.price}</h5>
    </div>
    <div class='cotrls'>
      <h5>MT ${cartItem.price}</h5>
      <div class='cotrls-amounts'>
        <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
        <p class="item-amount">${cartItem.amount}</p>
        <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
      </div>
    </div>
    </div>
    <a href="#" class="remove-item remove" data-id=${cartItem.id}><i class="fas fa-times-circle"></i></a>
  `;
};
