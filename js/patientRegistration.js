import config from "./config.js";

document.getElementById("patient-form").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent default form submission

    const today = new Date().toISOString().split("T")[0];
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const ssn = document.getElementById("ssn").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match. Please try again.");
        return;
    }

    if (ssn.length !== 9) {
        alert("SSN must be exactly 9 digits.");
        return;
    }

    const formData = {
        firstName: document.getElementById("first-name").value,
        lastName: document.getElementById("last-name").value,
        dateOfBirth: document.getElementById("dob").value,
        ssn: ssn,
        email: document.getElementById("email").value,
        password: password,
        role: "Patient",
        InsuranceName: document.getElementById("insurance-name").value,
        MemberID: document.getElementById("member-id").value
    };
    

    if (new Date(formData.dateOfBirth) >= new Date(today)) {
        alert("Please select a date before today.");
        return;
    }

    if (!config.useRealAPI) {
        console.log("Simulated account creation. Form data:", formData);
        alert("Account created successfully (simulation)! Check the console for details.");
    } else {
        try {
            const response = await fetch(config.API_ENDPOINTS.register, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                document.getElementById("patient-form").style.display = "none";
                document.getElementById("account-created-message").style.display = "flex";
            } else {
                
                const errorMessage = await response.text();
                alert("Error: " + errorMessage);
            }
        } catch (error) {
            console.error("API Call Failed:", error);
            alert("Failed to create account. Please try again.");
        }
    }
});
