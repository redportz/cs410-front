import config from "./config.js";
document.getElementById("login-form").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent default form submission

    const enteredEmail = document.getElementById("email").value;
    const enteredPassword = document.getElementById("password").value;
    let user=null;


    if (!config.useRealAPI) {
        const users = [
            { UserId: 25, FirstName: "Admin", LastName: "Test", DateOfBirth: "1990-01-01T00:00:00", SSN: "987654321", Email: "AdminTest@email.com", Password: "pass123", role: "Administrator" },
            { UserId: 24, FirstName: "Doctor", LastName: "Test", DateOfBirth: "1980-01-01T00:00:00", SSN: "123456789", Email: "DoctorTest@email.com", Password: "pass123", role: "Doctor" },
            { UserId: 21, FirstName: "Eric", LastName: "Zba", DateOfBirth: "2025-03-04T00:00:00", SSN: "654654564", Email: "PatientTest@email.com", Password: "pass123", role: "Patient" }
        ];
    
        const user = users.find(u => u.Email === enteredEmail && u.Password === enteredPassword);
    
        if (!user) {
            alert("Login failed. Please try again.");
            return;
        }
    
        localStorage.setItem("userId", user.UserId);
        handleLoginSuccess(user);
    }
    
    else{
        try {
            const response = await fetch(config.API_ENDPOINTS.login, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: enteredEmail, password: enteredPassword }) 
            });

            if (response.ok) {
                const result = await response.json();
                localStorage.setItem("userId", result.userId);
                localStorage.setItem("userRole", result.role);
                
                handleLoginSuccess(result);
                
            } else {
                throw new Error(await response.text()); 
            }
        } catch (apiError) {
            console.error("API Call Failed:", apiError);
            alert("Login failed. Please try again.");
        }
    }
});

// 🔹 Function to handle login success, store user data & redirect
function handleLoginSuccess(user) {
    // Store user info for session use
    storeUserData(user);

    // Redirect based on role
    switch (user.role) {
        case "Patient":
            window.location.href = "../Patient/Dashboard.html";
            break;
        case "Doctor":
            window.location.href = "../Doctor/Dashboard.html";
            break;
        case "Admin":
            window.location.href = "../admin/Dashboard.html";
            break;
        default:
            alert("Unknown role. Please contact support.");
    }
}

function storeUserData(user) {
    localStorage.setItem("user", JSON.stringify(user));

}
