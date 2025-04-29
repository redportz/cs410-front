import config from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
    const userId = parseInt(localStorage.getItem("userId")); // Get user ID from local storage
    if (!userId) {
        console.error("User ID not found in localStorage.");
        return;
    }

    fetch(`${config.API_ENDPOINTS.prescriptions}?userId=${userId}`) // Fetch prescriptions based on userId
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("Prescription-display");
            container.innerHTML = ""; // Clear previous entries

            if (data.prescriptions.length ===0) {
                document.querySelector("main").classList.add("no-prescriptions");
                document.getElementById("prescription-box").classList.add("hidden");
                document.getElementById("no-prescriptions").classList.remove("hidden");

            } else {
                data.prescriptions.forEach(prescription => {
                    const prescriptionDiv = document.createElement("div");
                    prescriptionDiv.classList.add("prescription");
                    prescriptionDiv.innerHTML = `
                        <h3>${prescription.name}</h3>
                    `;
                    prescriptionDiv.addEventListener("click", () => {
                        displayPrescriptionDetails(prescription, prescriptionDiv);
                    });
                    container.appendChild(prescriptionDiv);
                });
            }
        })
        .catch(error => console.error("Error loading prescriptions:", error));
});

function displayPrescriptionDetails(prescription, clickedDiv) {
    const container = document.getElementById('Prescription-display');
    const detailsContainer = document.getElementById("prescription-container");
    const prescriptionBox = document.getElementById("prescription-box"); // ✅ Get prescription-box

    if (!detailsContainer || !prescriptionBox) {
        console.error("Error: prescription-container or prescription-box not found.");
        return;
    }

    const isCurrentlyDisplayed = detailsContainer.style.display === 'block' &&
        detailsContainer.getAttribute('data-current-prescription') === prescription.name;

    const allPrescriptions = container.querySelectorAll('.prescription');

    if (isCurrentlyDisplayed) {
        // ✅ Restore all prescriptions and remove styling from #prescription-box
        allPrescriptions.forEach(p => {
            p.style.display = 'block';
            p.classList.remove('onclick');
        });
        prescriptionBox.classList.remove('onclick'); // ✅ Remove class when closing
        detailsContainer.style.display = 'none';
        detailsContainer.removeAttribute('data-current-prescription');
        container.classList.remove('onclick');
    } else {
        // Hide all prescriptions except the clicked one
        allPrescriptions.forEach(p => {
            p.style.display = 'none';
            p.classList.remove('onclick');
        });

        // Make sure the clicked prescription stays visible
        clickedDiv.style.display = 'block';
        clickedDiv.classList.add('onclick'); 

        // Add "onclick" class to #prescription-box to change its styling
        prescriptionBox.classList.add('onclick');

        // Show prescription details
        detailsContainer.innerHTML = `
            <h3>${prescription.name}</h3>
            <p><strong>How many to take:</strong> ${prescription.dosage}</p>
            <p><strong>How often:</strong> ${prescription.frequency}</p>
            <p><strong>Strength:</strong> ${prescription.milligrams} mg</p>
            <p><strong>Refills Left:</strong> ${prescription.refills}</p>
            <p><strong>Doctor who prescribed it:</strong> ${prescription.doctor}</p>
            <p><strong>Ph:</strong> ${prescription.phone}</p>
        `;

        detailsContainer.style.display = 'block';
        detailsContainer.setAttribute('data-current-prescription', prescription.name);
        container.classList.add('onclick');
    }
}
