import config from "./config.js";

const userId = localStorage.getItem("userId"); 


const editBtn = document.getElementById("edit-info-btn");
const phoneAndAddressContainer = document.getElementById("phone-and-address-container");
const editContainer = document.getElementById("edit-container");
let originalPhoneNumber="";
let originalAddress = "";const input = document.getElementById("autocomplete-input");
const suggestionsList = document.getElementById("suggestions-list");
const cancelBtn = document.getElementById("cancel-personal-info-edit");
const phoneNum=document.getElementById("phoneNumber-display")
const homeAddress=document.getElementById("address-display")



document.addEventListener("click", (event) => {
  // If click is outside the input and the suggestion list
  if (!input.contains(event.target) && !suggestionsList.contains(event.target)) {
    suggestionsList.innerHTML = ""; // Clear the list
  }
});

// fetch user info from backend for view/edit
async function fetchPatientInfo() {
  try {
    const response = await fetch(`${config.API_ENDPOINTS.getUserInfo}/${userId}`);
    const data = await response.json(); 
    originalPhoneNumber = data.phoneNumber;
    originalAddress = data.address;
    console.log(data);

    const formattedDate = new Date(data.dateOfBirth).toLocaleDateString("en-US");
    // Populate text fields with read-only data (non-editable fields)
    document.getElementById("firstName").textContent = data.firstName;
    document.getElementById("lastName").textContent = data.lastName;
    document.getElementById("email").textContent = data.email;
    document.getElementById("dob").textContent = formattedDate;
    
    
    phoneNum.textContent = originalPhoneNumber || "Not Available";
    homeAddress.textContent = originalAddress || "Not Available";


  } catch (err) {
    console.error("Failed to get user info:", err);
  }
}

editBtn.addEventListener("click", () => {
  phoneAndAddressContainer.classList.add("hidden");
  editContainer.classList.remove("hidden");
  document.getElementById("phone").value = originalPhoneNumber;
  document.getElementById("autocomplete-input").value = originalAddress;
});

// update user info when form is submitted
document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const phoneInput = document.getElementById("phone").value.trim();
  const addressInput = document.getElementById("autocomplete-input").value.trim();

  
  const updatedUser = {
    PhoneNumber: phoneInput !== "" ? phoneInput : originalPhoneNumber,
    Address: addressInput !== "" ? addressInput : originalAddress,
  };


  try {
    // PUT request for updating patient info for phone number and address

    const response = await fetch(`${config.API_ENDPOINTS.updatePatientInfo}/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      
      
      body: JSON.stringify(updatedUser),
    });
    

    if (response.ok) {

      editContainer.classList.add("hidden");
      phoneAndAddressContainer.classList.remove("hidden");
      fetchPatientInfo()
    } else {
      alert("Failed to update info.");
    }
  } catch (err) {
    console.error("Update failed:", err);
  }
});
window.onload = fetchPatientInfo;

// call function to load the user info when the page loads
cancelBtn.addEventListener("click", () => {

  document.getElementById("phone").value = originalPhoneNumber;
  document.getElementById("autocomplete-input").value = originalAddress;

  editContainer.classList.add("hidden");

  phoneAndAddressContainer.classList.remove("hidden");

  suggestionsList.innerHTML = "";
});
