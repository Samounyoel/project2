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
    if (user.email == email && user.password == password) {
      localStorage.setItem("user", JSON.stringify(user));
      const allUserProfiles = JSON.parse(localStorage.getItem("ALL_USER_PROFILES") || "{}");
      
      // Check if the current user has an entry in ALL_USER_PROFILES
      if (user && user.userId && allUserProfiles[user.userId]) {
        window.location.href = "home.html"; // User has a detailed profile, go to home
      } else {
        window.location.href = "profile.html"; // No detailed profile found, go to profile page
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