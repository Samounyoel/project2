$("#logInBtn").click(() => {
  let email = $("#email").val();
  let password = $("#password").val();
  if (email == "" || password == "") {
    alert("All fields are required.");
    return;
  } else {
    let users = JSON.parse(localStorage.getItem("USERS"));
    if (users) {
      for (let i in users) {
        let user = users[i];
        if (user.email == email) {
          if (user.password == password) {
            // Store the logged-in user in localStorage
            localStorage.setItem("currentUSER", JSON.stringify(user));

            // Check the user's configuration (role)
            if (user.configuration === "admin" || user.configuration === "manager") {
              // Redirect to the manager's home page
              window.location.href = "./home-manager.html";
            } else {
              // Redirect to the developer's home page
              window.location.href = "./home.html";
            }

            clearInputs();
            return;
          } else {
            alert("Incorrect Password!");
            return;
          }
        }
      }
    }
    alert("Account not found!");
  }
});

function clearInputs() {
  $("#email").val("");
  $("#password").val("");
}