class USER {
  constructor(firstName, lastName, email, password, userId, profilePicture, about) {
    this.firstName = firstName;
    this.lastName = lastName
    this.email = email;
    this.password = password;;
    this.userId = userId;
    this.profilePicture = profilePicture;
    this.about = about;
  }
}

$("#registerBtn").click(async () => {
  //Collects user input:
  let firstName = document.getElementById("first-name").value;
  let lastName = document.getElementById("last-name").value;
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  let confirmPassword = document.getElementById("confirm-password").value;

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
      let newUSER = new USER(firstName, lastName, email, password);
      //Checking if an Email is already registered:
      if (!checkEmail(email, users)) {
        return; //Stops the registration if an Email is already taken
      }
      //Converts the profile picture:
      let profilePic = await convertProfilePic();

      newUSER.profilePicture = profilePic;

      if (users.length > 0) {
        newUSER.userId = users[users.length - 1].userId + 1;
        users.push(newUSER);
        localStorage.setItem("USERS", JSON.stringify(users));
      } else {
        //The id of the first created user: 
        newUSER.userId = 1;
        localStorage.setItem("USERS", JSON.stringify([newUSER]));
      }
    }
    clearInputs();
    window.location.href = "./login.html";
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
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = function () {
        const base64 = reader.result;
        resolve(base64);
      }
      reader.readAsDataURL(file);
    })
  }
}
