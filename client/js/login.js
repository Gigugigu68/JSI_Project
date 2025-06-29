const loginForm = document.querySelector(".login-form");
const emailForm = loginForm.querySelector("#email");
const passwordForm = loginForm.querySelector("#password");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = emailForm.value;
  const password = passwordForm.value;

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      firebase.firestore().collection("users").doc(user.uid).get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();

             // Tạo object lưu localStorage
            const userInfo = {
              uid: user.uid,
              email: user.email,
              ...userData  // merge toàn bộ thông tin Firestore
            };

            localStorage.setItem("user_session", JSON.stringify(userInfo));

            // Chuyển hướng dựa trên role_id
            if (userData.role_id == 1) {
              window.location.href = "admin.html";
            } else if (userData.role_id == 2) {
              window.location.href = "index.html";
            } else {
              alert("Role không hợp lệ!");
            }
          } else {
            alert("Không tìm thấy thông tin người dùng!");
          }
        });
    })
    .catch((error) => {
      alert("Lỗi: " + error.message);
    });
});
