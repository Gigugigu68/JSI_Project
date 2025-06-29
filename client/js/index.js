let products = [];
let cart = [];

function addToCart(id) {
  const product = products.find((p) => p.id === id);
  const existing = cart.find((item) => item.id === id);
  alert("Sản phẩm đã thêm vào giỏ");
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cart-count").innerText = count;
}

function showCart() {
  const modal = new bootstrap.Modal(document.getElementById("cartModal"));
  renderCartItems();
  modal.show();
}

function renderProducts() {
  const container = document.getElementById("product-list");
  products.forEach((product) => {
    const html = `
        <div class="col">
            <div class="card product-card h-100">
            <img src="${product.image}" class="card-img-top" alt="${
      product.name
    }">
            <div class="card-body">
                <h5 class="card-title">
                    <a href="details.html?id=${
                      product.id
                    }" class="text-decoration-none text-dark">
                        ${product.name}
                    </a>
                </h5>
                <p class="text-danger fw-bold">${product.price.toLocaleString()}đ</p>
                <button class="btn btn-success w-100" onclick="addToCart('${
                  product.id
                }')">Thêm vào giỏ</button>
            </div>
            </div>
        </div>
        `;
    container.innerHTML += html;
  });
}

function renderCartItems() {
  const cartContainer = document.getElementById("cart-items");
  cartContainer.innerHTML = "";

  let total = 0;

  cart.forEach((item) => {
    const itemHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
            <strong>${item.name}</strong><br>
            Số lượng: ${item.quantity} x ${item.price.toLocaleString()}đ
            </div>
            <div>
            <strong>${(item.quantity * item.price).toLocaleString()}đ</strong>
            </div>
        </div>
        `;
    cartContainer.innerHTML += itemHTML;
    total += item.quantity * item.price;
  });

  document.getElementById("cart-total").innerText = total.toLocaleString();
}

function loadProductsFromFirebase() {
  db.collection("products")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        let data = doc.data();
        let product = {
          id: doc.id,
          name: data.name,
          price: data.price, // đừng quên thêm price nếu có
          image: data.image,
        };
        products.push(product);
      });

      // Sau khi load xong, render sản phẩm
      renderProducts();
    })
    .catch((error) => {
      console.error("Lỗi khi load dữ liệu từ Firebase:", error);
    });
}

function checkout() {
  if (cart.length === 0) {
    alert("Giỏ hàng đang trống!");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    items: cart,
    total: total,
    createdAt: new Date(),
  };

  db.collection("orders")
    .add(order)
    .then(() => {
      alert("Đặt hàng thành công!");
      cart = [];
      updateCartCount();
      renderCartItems();
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("cartModal")
      );
      modal.hide();
    })
    .catch((error) => {
      console.error("Lỗi khi thanh toán:", error);
      alert("Có lỗi xảy ra khi thanh toán.");
    });
}

function checkSession() {
  const btnLogin = document.querySelector(".btnLogin");
  const userName = document.querySelector(".userName");
  const session = localStorage.getItem("user_session");
  if (session) {
    const user = JSON.parse(session);
    btnLogin.innerHTML = "Đăng xuất";
    userName.innerHTML = user.usernameForm;
    console.log("User logged in:", user);
  } else {
    console.log("No user session found.");
    // Redirect tới trang login nếu cần
    window.location.href = "login.html";
  }
}

window.addEventListener("DOMContentLoaded", function () {
  checkSession();
  loadProductsFromFirebase();
});
