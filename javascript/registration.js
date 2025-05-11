class USER {
  constructor(firstName, lastName, email, password, userId, profilePicture, linkedinLink, about) {
    this.firstName = firstName;
    this.lastName = lastName
    this.email = email;
    this.password = password;
    this.userId = userId;
    this.profilePicture = profilePicture;
    this.linkedinLink = linkedinLink;
    this.about = about;
  }
}

$("#registerBtn").click(async (event) => { // Added event parameter
  event.preventDefault(); // Prevent default submit behavior
  //Collects user input:
  let firstName = document.getElementById("first-name").value;
  let lastName = document.getElementById("last-name").value;
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  let confirmPassword = document.getElementById("confirm-password").value;
  let newUSER; // Declare newUSER in the outer scope

  if (firstName == "" || lastName == "" || email == "" || password == "" || confirmPassword == "") {
    alert("All fields are required.");
    return;
  } else {
    //Validates the password:
    if (password !== confirmPassword) {
      alert("Passwords do not match! Try again.");
      return;
    } else {
      let users = JSON.parse(localStorage.getItem("USERS")) || [];
      newUSER = new USER(firstName, lastName, email, password, null, null, ""); // Assign to existing newUSER variable
      //Checking if an Email is already registered:
      if (!checkEmail(email, users)) {
        return; //Stops the registration if an Email is already taken
      }
      //Converts the profile picture:
      let profilePic;
      try {
        profilePic = await convertProfilePic();
      } catch (error) {
        console.error("Error converting profile picture:", error);
        profilePic = "../pics/defaultPic.png"; // Fallback to default
      }

      newUSER.profilePicture = profilePic;

      // Robust userId assignment
      if (users.length > 0) {
        let currentMaxId = 0;
        // Iterate through all users to find the true maximum ID
        users.forEach(u => {
          if (u && typeof u.userId === 'number' && !isNaN(u.userId) && u.userId > currentMaxId) {
            currentMaxId = u.userId;
          }
        });
        newUSER.userId = currentMaxId + 1;
        users.push(newUSER); // Add the new user to the existing array
        localStorage.setItem("USERS", JSON.stringify(users));
      } else {
        // This is the first user
        newUSER.userId = 1;
        localStorage.setItem("USERS", JSON.stringify([newUSER])); // Create a new array with only the new user
      }
    }
    localStorage.setItem("user", JSON.stringify(newUSER)); // Log in the new user
    localStorage.setItem("isNewUser", "true"); // Flag for profile page
    clearInputs();
    window.location.href = "./profile.html"; // Redirect to profile page
  }
})


//Making sure a user can't register with the same email address:
function checkEmail(email, users) {
  //Checks for existing email in users:
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      alert("Email already used. Use a different one.");
      return false;
    }
  }
  //If no match is found, it returns true (email is available and the user can be created):
  return true;
}

//Clearing all the inputs after a user registered:
function clearInputs() {
  $("#first-name").val("");
  $("#last-name").val("");
  $("#email").val("");
  $("#password").val("");
  $("#confirm-password").val("");
  $("#profilePicInput").val("")
}


//Converts the pic file to a string (in order to save it in local storge):
function convertProfilePic() {
  const file = document.getElementById("profilePicInput").files[0];
  if (!file) {
    return "../pics/defaultPic.png";
  }
  else {
    return new Promise((resolve, reject) => { // Added reject parameter
      const reader = new FileReader();
      reader.onloadend = function () {
        const base64 = reader.result;
        resolve(base64);
      }
      // Add error handling for FileReader
      reader.onerror = function (error) {
        console.error("FileReader error:", error);
        resolve("../pics/defaultPic.png"); // Fallback to default pic on read error
      }
      reader.readAsDataURL(file);
    })
  }
}
