const registerForm = document.querySelector("#register");
const username = registerForm.querySelector("#username");
const email = registerForm.querySelector("#email");
const password = registerForm.querySelector("#password");
const confirmPassword = registerForm.querySelector("#confirm_password");

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  let usernameForm = username.value;
  let emailForm = email.value;
  let passwordForm = password.value;
  let confirmPasswordForm = confirmPassword.value;
  let role_id = 2;
  let address = '';
  let age = '';

  // check fields empty
  if (!usernameForm || !emailForm || !passwordForm || !confirmPasswordForm) {
    alert("Vui lòng điền đủ các trường");
    return;
  }
  if (passwordForm != confirmPasswordForm) {
    alert("Mật khẩu không khớp");
    return;
  }

  const passwordStrengthRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordStrengthRegex.test(passwordForm)) {
    alert(
      "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ thường, chữ in hoa, số và ký tự đặc biệt."
    );
    return;
  }

  firebase
    .auth()
    .createUserWithEmailAndPassword(emailForm, passwordForm)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;
      console.log(user.uid);
      // Thông tin người dùng
      let userData = {
        address,
        age,
        usernameForm,
        emailForm,
        passwordForm,
        role_id: role_id,
        balance: 0, // số dư ví mặc định là 0
      };
      console.log(userData);
      db.collection("users")
        .doc(user.uid)
        .set(userData)
        .then((docRef) => {
          alert("Đăng ký thành công");
          window.location.href = "login.html";
        })
        .catch((error) => {
          alert("Đăng ký thất bại");
        });
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      // ..
      alert(`Lỗi: ${errorMessage}`);
      console.log(errorMessage);
    });
});
