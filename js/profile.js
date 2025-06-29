// Function để lấy dữ liệu từ localStorage
function getFromStorage(key) {
  return localStorage.getItem(key);
}

// Function để lưu dữ liệu vào localStorage
function saveToStorage(key, value) {
  localStorage.setItem(key, value);
  console.log("Đã lưu:", key, value);
}

// Lấy thông tin user từ localStorage
function getUserInfo() {
  const userSession = getFromStorage("user_session");
  if (userSession) {
    try {
      return JSON.parse(userSession);
    } catch (error) {
      console.error("Lỗi parse JSON:", error);
      return null;
    }
  }
  return null;
}

// Hiển thị thông tin role
function displayRole(roleId) {
  const roleBadge = document.getElementById("roleBadge");
  if (roleId === 2) {
    roleBadge.textContent = "Khách hàng";
    roleBadge.className = "role-badge role-customer";
  } else if (roleId === 1) {
    roleBadge.textContent = "Admin";
    roleBadge.className = "role-badge role-admin";
  } else {
    roleBadge.textContent = "Người dùng";
    roleBadge.className = "role-badge";
  }
}

// Populate form với dữ liệu
function populateForm(userData) {
  // Hiển thị thông tin trong info section
  document.getElementById("displayId").textContent = userData.role_id || "N/A";
  document.getElementById("displayUsername").textContent =
    userData.usernameForm || userData.username || "N/A";
  document.getElementById("displayEmail").textContent =
    userData.emailForm || userData.email || "N/A";
  document.getElementById("displayBalance").textContent = userData.balance
    ? userData.balance.toLocaleString("vi-VN") + " VNĐ"
    : "0 VNĐ";

  // Populate form fields
  document.getElementById("username").value =
    userData.usernameForm || userData.username || "";
  document.getElementById("email").value =
    userData.emailForm || userData.email || "";
  document.getElementById("balance").value = userData.balance || 0;

  // Thêm các trường mới nếu có trong dữ liệu
  document.getElementById("age").value = userData.age || "";
  document.getElementById("address").value = userData.address || "";

  // Hiển thị role
  displayRole(userData.role_id);

  // Cập nhật navbar với thông tin user
  updateNavbar(userData);
}

// Cập nhật thông tin user trên navbar
function updateNavbar(userData) {
  const userNameElement = document.querySelector(".userName");
  const btnLoginElement = document.querySelector(".btnLogin");
  const loginButton = document.querySelector(".btn-outline-primary");

  if (userData && userData.usernameForm) {
    // Hiển thị tên user
    if (userNameElement) {
      userNameElement.textContent = "Hello " + userData.usernameForm;
      userNameElement.href = "#";
    }

    // Thay đổi button thành logout
    if (btnLoginElement && loginButton) {
      btnLoginElement.textContent = "Đăng xuất";
      btnLoginElement.href = "#";
      loginButton.onclick = function (e) {
        e.preventDefault();
        logout();
      };
    }
  }
}

// Function logout
function logout() {
  if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    localStorage.removeItem("user_session");
    window.location.href = "./login.html";
  }
}

// Xử lý submit form
function handleFormSubmit(e) {
  e.preventDefault();

  const userInfo = getUserInfo();
  if (!userInfo) {
    alert("Không tìm thấy thông tin người dùng!");
    return;
  }

  // Validation
  const email = document.getElementById("email").value;
  const age = document.getElementById("age").value;
  const address = document.getElementById("address").value;

  if (email && !isValidEmail(email)) {
    alert("Email không hợp lệ!");
    return;
  }

  if (age && (age < 1 || age > 120)) {
    alert("Tuổi phải từ 1 đến 120!");
    return;
  }

  // Cập nhật thông tin
  const updatedInfo = {
    ...userInfo,
    emailForm: email,
    email: email, // Thêm cả 2 format cho tương thích
    age: age ? parseInt(age) : null,
    address: address.trim(),
  };

  const session = localStorage.getItem("user_session");
  if (session) {
    const user = JSON.parse(session);
    console.log("User logged in:", user);

    // Lưu lại vào localStorage
    saveToStorage("user_session", JSON.stringify(updatedInfo));
    db.collection("users")
      .doc(user.uid)
      .update(updatedInfo)
      .then(() => {
        alert("Cập nhật thông tin tài khoản thành công!");
      })
      .catch((error) =>
        console.error("Lỗi khi cập nhật thông tin tài khoản:", error)
      );

    // Hiển thị thông báo thành công
    showSuccessMessage("Cập nhật thông tin thành công!");

    // Refresh hiển thị
    populateForm(updatedInfo);
  }
}

// Validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Hiển thị thông báo thành công
function showSuccessMessage(message) {
  // Tạo toast notification
  const toast = document.createElement("div");
  toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
  toast.textContent = message;

  // Add CSS animation
  const style = document.createElement("style");
  style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
  document.head.appendChild(style);

  document.body.appendChild(toast);

  // Tự động ẩn sau 3 giây
  setTimeout(() => {
    toast.remove();
    style.remove();
  }, 3000);
}

// Kiểm tra xem user đã đăng nhập chưa
function checkAuthStatus() {
  const userInfo = getUserInfo();

  if (!userInfo) {
    // Chuyển hướng về trang login nếu chưa đăng nhập
    if (confirm("Bạn chưa đăng nhập. Chuyển hướng đến trang đăng nhập?")) {
      window.location.href = "./login.html";
    }
    return false;
  }

  return true;
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Kiểm tra trạng thái đăng nhập
  if (!checkAuthStatus()) {
    return;
  }

  const userInfo = getUserInfo();

  if (userInfo) {
    populateForm(userInfo);
  }

  // Thêm event listener cho form submit
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", handleFormSubmit);
  }
});

// Function để cập nhật số lượng giỏ hàng (nếu cần)
function updateCartCount() {
  const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
  const cartCountElement = document.getElementById("cart-count");
  if (cartCountElement) {
    cartCountElement.textContent = cartItems.length;
  }
}

// Function showCart (placeholder - cần implement)
function showCart() {
  // Implement logic hiển thị giỏ hàng
  alert("Chức năng giỏ hàng đang được phát triển");
}

// Cập nhật cart count khi trang load
document.addEventListener("DOMContentLoaded", function () {
  updateCartCount();
});
