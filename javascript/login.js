$("#logInBtn").click(function() {
  var email = $("#email").val();
  var password = $("#password").val();
  if (email === "" || password === "") {
    alert("All fields are required.");
    return;
  }
  var users = JSON.parse(localStorage.getItem("USERS") || "[]");
  var found = false;
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    if (user.email === email && user.password === password) {
      localStorage.setItem("currentUSER", JSON.stringify(user));
      var profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
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