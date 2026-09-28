// ---- Product Data ----
const products = [
  {name:"Coffee Mug", price:199, description:"Ceramic mug for hot/cold drinks.", category:"Kitchen", emoji:"☕"},
  {name:"Wireless Mouse", price:549, description:"Smooth, compact, battery-powered.", category:"Electronics", emoji:"🖱️"},
  {name:"Notebook", price:79, description:"100-page ruled notebook.", category:"Stationery", emoji:"📒"},
  {name:"Pencil Box", price:119, description:"Multipurpose zip pouch.", category:"Stationery", emoji:"✏️"},
  {name:"Succulent Plant", price:249, description:"Low-care green plant for desk.", category:"Decor", emoji:"🌵"},
  {name:"Wrist Watch", price:1249, description:"Analog with leather strap.", category:"Accessories", emoji:"⌚"},
  {name:"Travel Bottle", price:399, description:"Steel bottle, 600ml capacity.", category:"Kitchen", emoji:"🥤"},
  {name:"Earphones", price:299, description:"In-ear with mic (3.5mm jack)", category:"Electronics", emoji:"🎧"},
];
const CATEGORIES = [...new Set(products.map(p=>p.category))];
// ---- Cart Logic ----
function cartLoad() {
  return JSON.parse(localStorage.getItem("cart")||"[]");
}
function cartSave(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}
function cartCount(cart) {
  return cart.reduce((n,item)=>n+item.qty,0);
}
function cartFind(cart,name) {
  return cart.find(item=>item.name===name);
}
// ---- DOM Refs ----
const gridEl = document.getElementById("productGrid");
const catSel = document.getElementById("categoryFilter");
const searchEl = document.getElementById("searchBox");
const cartBtn = document.getElementById("cartBtn");
const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");
const checkoutModal = document.getElementById("checkoutModal");
const cartCountEl = document.getElementById("cartCount");
// ---- Render Product Grid ----
let filterCat = "", filterText = "";
function renderProducts() {
  let list=products.filter(p=>(!filterCat||p.category===filterCat) && p.name.toLowerCase().includes(filterText));
  gridEl.innerHTML = list.length ? list.map(p=>
    `<div class="product">
      <div class="product-emoji">${p.emoji}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-description">${p.description}</div>
      <div class="product-price">₹${p.price}</div>
      <button class="add-to-cart-btn" data-name="${p.name}">Add to cart</button>
    </div>`).join("")
    : `<div class="empty-cart-message" style="width:100%;grid-column:1/-1">No products found.</div>`;
}
// ---- Attach Category Options ----
function fillCategories() {
  catSel.innerHTML = '<option value="">All Categories</option>' +
    CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join("");
}
// ---- Product Add ----
gridEl.addEventListener("click",e=>{
  if (e.target.classList.contains("add-to-cart-btn")) {
    let cart=cartLoad();
    let n=e.target.dataset.name;
    let prod=products.find(x=>x.name===n);
    let ci=cartFind(cart,n);
    if(ci){ci.qty++;} else cart.push({name:n,qty:1});
    cartSave(cart);
    updateCartCount(cart);
    animateCartBtn();
  }
});
// ---- Update Cart Badge ----
function updateCartCount(cart) {
  cartCountEl.textContent = cartCount(cart||cartLoad());
}
function animateCartBtn(){cartBtn.animate([{transform:"scale(1.05)"},{transform:"scale(1.19)"},{transform:"scale(1)"}],{duration:380});}
// ---- Search & Filter ----
searchEl.addEventListener('input',e=>{filterText=e.target.value.trim().toLowerCase(); renderProducts();});
catSel.addEventListener('change',e=>{filterCat=e.target.value; renderProducts();});
// ---- Cart Panel Display ----
cartBtn.addEventListener('click',showCartPanel);
overlay.addEventListener('click',panelClose);
function showCartPanel(){
  renderCartPanel();
  cartPanel.classList.remove('hidden');
  overlay.classList.remove('hidden');
}
function panelClose(){
  cartPanel.classList.add('hidden');
  checkoutModal.classList.add('hidden');
  overlay.classList.add('hidden');
}
// ---- Render Cart Panel ----
function renderCartPanel(){
  let cart=cartLoad();
  cartPanel.innerHTML = `<div class="cart-header">
    <span>Cart</span>
    <button class="cart-close" title="Close">×</button>
  </div>
  <div class="cart-items-list">
    ${cart.length?cart.map(ci=>{
      let p=products.find(x=>x.name===ci.name);
      return `<div class="cart-item">
        <span class="cart-item-emoji">${p.emoji}</span>
        <span class="cart-item-name">${ci.name}</span>
        <div class="cart-item-controls">
          <button class="cart-item-btn cart-minus" data-name="${ci.name}">-</button>
          <span class="cart-item-qty">${ci.qty}</span>
          <button class="cart-item-btn cart-plus" data-name="${ci.name}">+</button>
        </div>
        <button class="cart-item-btn cart-item-remove-btn" data-name="${ci.name}" title="Remove">✕</button>
        <span class="cart-item-total">₹${ci.qty*p.price}</span>
      </div>`
    }).join(""):`<div class="empty-cart-message">Cart is empty.</div>`}
  </div>
  <div class="cart-total-row">
    <span>Total</span>
    <span>₹${cart.reduce((tot,ci)=>{
      let p=products.find(x=>x.name===ci.name); return tot+ci.qty*p.price;
    },0)}</span>
  </div>
  <button class="checkout-btn"${!cart.length?' disabled':''}>Checkout</button>`;
}
// Cart Panel: Close btn, +, -, remove, checkout
cartPanel.addEventListener('click',e=>{
  let t=e.target,cart=cartLoad();
  if(t.classList.contains('cart-close'))panelClose();
  if(t.classList.contains('cart-plus')){
    let ci=cartFind(cart,t.dataset.name);ci.qty++;cartSave(cart);
    renderCartPanel();updateCartCount(cart);
  }
  if(t.classList.contains('cart-minus')){
    let ci=cartFind(cart,t.dataset.name);
    if(ci.qty>1)ci.qty--; else cart=cart.filter(x=>x.name!==ci.name);
    cartSave(cart); renderCartPanel();updateCartCount(cart);
  }
  if(t.classList.contains('cart-item-remove-btn')){
    cart=cart.filter(x=>x.name!==t.dataset.name);
    cartSave(cart); renderCartPanel();updateCartCount(cart);
  }
  if(t.classList.contains('checkout-btn') && !t.disabled){
    showCheckoutModal();
  }
});
// ---- Checkout ----
function showCheckoutModal(){
  let cart=cartLoad();
  checkoutModal.innerHTML = `<h3>Checkout</h3>
    <form class="checkout-form" autocomplete="off">
      <div class="form-group">
        <label>Name*</label>
        <input name="name" required maxlength="32">
        <div class="error" data-err="name"></div>
      </div>
      <div class="form-group">
        <label>Phone*</label>
        <input name="phone" required maxlength="14" pattern="[0-9+\- ]+">
        <div class="error" data-err="phone"></div>
      </div>
      <div class="form-group">
        <label>Address*</label>
        <textarea name="address" required maxlength="90" style="min-height:2.5em;"></textarea>
        <div class="error" data-err="address"></div>
      </div>
      <button class="submit-btn" type="submit">Place Order</button>
    </form>`;
  checkoutModal.classList.remove('hidden');
}
// Form logic
checkoutModal.addEventListener('submit',function(e){
  e.preventDefault();
  let fd = Object.fromEntries(new FormData(e.target));
  let err = {};
  if(!fd.name.trim())err.name="Enter name";
  if(!fd.phone.trim()||!/^[0-9+\- ]{8,}$/.test(fd.phone.trim()))err.phone="Enter a valid phone";
  if(!fd.address.trim()||fd.address.length<6)err.address="Enter valid address";
  e.target.querySelectorAll('.error').forEach(div=>div.textContent = err[div.dataset.err]||"");
  if(Object.keys(err).length) return;
  // SUCCESS: show order confirm
  let orderNo = "AN" + Date.now().toString(36).toUpperCase();
  checkoutModal.innerHTML = `<div class="order-confirm">
      <h3>Order placed!</h3>
      <div class="order-number">Order #${orderNo}</div>
      <div style="margin-top:1.1em;font-size:1.11em;">Thank you, <b>${fd.name}</b>!</div>
      <button class="close-confirm">Done</button>
    </div>`;
  cartSave([]); updateCartCount([]); renderProducts();
});
checkoutModal.addEventListener('click',function(e){
  if(e.target.classList.contains('close-confirm')){
    checkoutModal.classList.add('hidden');
    panelClose();
  }
});
// ---- Startup ----
fillCategories();
renderProducts();
updateCartCount();
//
