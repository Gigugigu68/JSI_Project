window.addEventListener("DOMContentLoaded", () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const uid = user.uid;
      db.collection("users").doc(uid).get().then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            const roleId = userData.role_id;
            if (roleId === 1){
              document.getElementById("adminName").textContent =
                "Xin chào, " + userData.usernameForm;
            } else {
              alert("Bạn không có quyền truy cập trang này.");
              firebase
                .auth()
                .signOut()
                .then(() => {
                  window.location.href = "login.html";
                });
            }
          } else {
            alert("Không tìm thấy dữ liệu người dùng.");
            window.location.href = "login.html";
          }
        })
        .catch((error) => {
          console.error("Lỗi truy vấn Firestore:", error);
          window.location.href = "login.html";
        });
    } else {
      window.location.href = "login.html";
    }
  });
});


// Đăng xuất
const logoutButton = document.querySelector(".logoutButton");
logoutButton.addEventListener("click", ()=>{
  firebase.auth().signOut().then(() => {
        alert("Đăng xuất thành công!");
        window.location.href = "login.html";
    }).catch((error) => {
        alert("Lỗi khi đăng xuất: " + error.message);
    });
});


// CRUD sản phẩm
function resetForm() {
    document.getElementById('productName').value = "";
    document.getElementById('productPrice').value = "";
    document.getElementById('productImage').value = "";
}

const addButton = document.querySelector(".addButton");
addButton.addEventListener("click", ()=>{
    const productName = document.getElementById('productName').value;
    const productPrice = document.getElementById('productPrice').value;
    const productType = document.getElementById('productType').value;
    const productImage = document.getElementById('productImage').files[0];

    console.log(productImage);


    if (!productName || !productPrice || !productImage || !productType) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }
    
    let reader = new FileReader();
    reader.onload = function (e) {
        let imageUrl = e.target.result;

        db.collection("products").add({
            name: productName,
            price: parseInt(productPrice),
            type: productType,
            image: imageUrl
        }).then(() => {
            alert("Thêm sản phẩm thành công!");
            loadProducts(); 
        }).catch(error => console.error("Lỗi khi thêm sản phẩm:", error));
    };

    reader.readAsDataURL(productImage);
    resetForm();
})


function deleteProduct(id) {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
        db.collection("products").doc(id).delete().then(() => {
            alert("Xóa sản phẩm thành công!");
            
            loadProducts();
        }).catch(error => console.error("Lỗi khi xóa sản phẩm:", error));
    }
}

function editProduct(id, oldName, oldPrice) {
    let newName = prompt("Nhập tên mới:", oldName);
    let newPrice = prompt("Nhập giá mới:", oldPrice);

    if (newName && newPrice) {
        db.collection("products").doc(id).update({
            name: newName,
            price: parseInt(newPrice)
        }).then(() => {
            alert("Cập nhật sản phẩm thành công!");
            loadProducts();
        }).catch(error => console.error("Lỗi khi cập nhật sản phẩm:", error));
    }
}




// CRUD Tài khoản khách hàng

// CRUD Hóa đơn 





// Hiển thị sản phẩm
function ShowProducts() {
    let productList = document.getElementById("productList");
    productList.innerHTML = "";

    db.collection("products").get().then(snapshot => {
        let index = 1;
        snapshot.forEach(doc => {
            let data = doc.data();
            let row = `
                <tr class="text-center">
                    <td>${index++}</td>
                    <td><img src="${data.image}" width="50"></td>
                    <td>${data.name}</td>
                    <td>${data.type}</td> 
                    <td>${data.price}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editProduct('${doc.id}', '${data.name}', '${data.price}')">Sửa</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${doc.id}')">Xóa</button>
                    </td>
                </tr>
            `;
            productList.innerHTML += row;
        });
    });
}

// Hiển thị hóa đơn
function showOrder() {
    const container = document.getElementById('orderList');
    container.innerHTML = '';
  
    db.collection('orders').orderBy('createdAt', 'desc').get()
      .then(snapshot => {
        if (snapshot.empty) {
          container.innerHTML = '<p>Chưa có hóa đơn nào.</p>';
          return;
        }
        let index = 1

        snapshot.forEach(doc => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate().toLocaleString() || 'Không rõ';
          const total = data.total?.toLocaleString() || 0;
          const items = data.items || [];
            let itemsHtml = '';
          items.forEach(item => {
            itemsHtml += `<li>${item.name} - SL: ${item.quantity} x ${item.price.toLocaleString()}đ</li>`;
          });
  
          const invoiceHTML = `
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title">Hóa đơn - ${index++}</h5>
                <p><strong>Ngày:</strong> ${createdAt}</p>
                <ul>${itemsHtml}</ul>
                <p><strong>Tổng tiền:</strong> ${total}đ</p>
              </div>
            </div>
          `;
          container.innerHTML += invoiceHTML;
        });
      })
      .catch(error => {
        console.error('Lỗi khi tải hóa đơn:', error);
        container.innerHTML = '<p class="text-danger">Không thể tải hóa đơn.</p>';
      });
}


function showSection(sectionId) {
    document.getElementById('products').style.display = 'none';
    document.getElementById('orders').style.display = 'none';
    document.getElementById('customers').style.display = 'none';

    document.getElementById(sectionId).style.display = 'block';

    if (sectionId === 'orders') {
        showOrder();
    }
    else if (sectionId === 'products') {
        ShowProducts();
    }
    else{
        showCustomer();
    }
}

// Hiển thị giao diện sản phẩm
const productSection = document.querySelector(".productSection");
productSection.addEventListener("click", () => {
    showSection("products");
});

// Hiển thị giao diện hóa đơn
const orderSection = document.querySelector(".orderSection");
orderSection.addEventListener("click", () => {
    showSection("orders");
});

const customerSection = document.querySelector(".customerSection");
customerSection.addEventListener("click", () => {
    showSection("customers");
});

// Hiển thị giao diện admin
window.addEventListener("DOMContentLoaded", function () {
    showSection("products");
});

