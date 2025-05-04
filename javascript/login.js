$("#logInBtn").click(function() {
  const email = $("#email").val();
  const password = $("#password").val();
  if (email === "" || password === "") {
    alert("All fields are required.");
    return;
  }
  const users = JSON.parse(localStorage.getItem("USERS") || "[]");
  let found = false;
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    if (user.email === email && user.password === password) {
      localStorage.setItem("user", JSON.stringify(user));
      const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
      if (!profile.email || profile.email !== user.email) {
        window.location.href = "profile.html";
      } else {
        window.location.href = "home.html";
      }
      found = true;
      break;
    }
  }
  if (!found) {
    alert("Account not found or incorrect password!");
  }
  $("#email").val("");
  $("#password").val("");
});

function clearInputs() {
  $("#email").val("");
  $("#password").val("");
}