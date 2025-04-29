import config from "./config.js";

const userId = localStorage.getItem("userId");
let oldPrescriptionId;

// Fetch prescriptions for a specific patient
function fetchPrescriptions() {
    const patientId = document.getElementById("patientId").value;

    fetch(`${config.API_ENDPOINTS.prescriptions}?userId=${patientId}`)
        .then(async response => {
            const list = document.getElementById("prescriptions-list");
            const userInfo = document.getElementById("User-info-display")


            list.innerHTML = "";
            userInfo.innerHTML = "";
            document.getElementById("no-prescriptions").style.display = "none";

            if (!response.ok) {
                const errorText = await response.text(); // Catch non-JSON error
                console.error("Error:", errorText);
                userInfo.innerHTML = `<h3 style="color:red;">${errorText}</h3>`;
                document.getElementById("add-prescription-btn").style.display = "none";
                return;
            }
            
            const data = await response.json();            
            userInfo.innerHTML += `
                    <h3>${data.user.firstName} ${data.user.lastName}</h3>
                `;
            document.getElementById("add-prescription-btn").style.display = "block";

            if (data.prescriptions.length === 0) {
                document.getElementById("no-prescriptions").style.display = "block";
                return;
            }           

            data.prescriptions.forEach(prescription => {
                list.innerHTML += `
                    <div class="prescription-item">
                        <h3>${prescription.name}</h3>
                        <p>Dosage: ${prescription.dosage}</p>
                        <p>Refills Left: ${prescription.refills}</p>
                        <p>Strength (mg): ${prescription.milligrams}</p>
                        <p>Frequency: ${prescription.frequency}</p>
                        <p>Reason: ${prescription.reason}</p>
                        <div class="prescriptions-btns">
                            <button onclick="editPrescription(${prescription.id}, true)" class="edit-prescription-btn">Edit</button>
                            <button onclick="deletePrescription(${prescription.id})" class="delete-prescription-btn">Delete</button>
                        </div>
                    </div>
                `;
                
            });
        })
        .catch(error => {
            console.error("Error loading prescriptions:", error);
        });
}

window.fetchPrescriptions = fetchPrescriptions;

// Populate the form with prescription data for editing
function editPrescription(id, isEditing) {
    addPrescriptionSection();

    if (isEditing && id !== null) {
        fetch(`${config.API_ENDPOINTS.prescriptions}/${id}`)
            .then(response => response.json())
            .then(prescription => {
                document.getElementById("prescriptionId").value = prescription.id;
                document.getElementById("name").value = prescription.name;
                document.getElementById("dosage").value = prescription.dosage;
                document.getElementById("frequency").value = prescription.frequency;
                document.getElementById("milligrams").value = prescription.milligrams;
                document.getElementById("refills").value = prescription.refills;
                document.getElementById("doctor").value = prescription.doctor;
                document.getElementById("phone").value = prescription.phone;
                document.getElementById("reason").value = prescription.reason;
            });
    } else {
        // It's a new prescription — clear the form
        document.getElementById("prescriptionId").value = "";
        document.getElementById("name").value = "";
        document.getElementById("dosage").value = "";
        document.getElementById("frequency").value = "";
        document.getElementById("milligrams").value = "";
        document.getElementById("refills").value = "";
        document.getElementById("doctor").value = "";
        document.getElementById("phone").value = "";
        document.getElementById("reason").value = "";
    }

}
window.editPrescription= editPrescription;

function addPrescriptionButton(){
    // document.getElementById("new-prescription-Btn").classList.remove("hidden")
    editPrescription(null,false);
    
}

window.addPrescriptionButton = addPrescriptionButton;


function addPrescriptionSection(){   
    document.getElementById("add-prescription-btn").classList.toggle('hidden');
    document.getElementById("add-prescription-container").classList.toggle('hidden');
}
window.addPrescriptionSection= addPrescriptionSection;

// Handle form submission (Add or Update)
document.getElementById("prescription-form").addEventListener("submit", (event) => {
    event.preventDefault();
    


    const prescriptionId = document.getElementById("prescriptionId").value;
    const method = prescriptionId ? "PUT" : "POST";
    const endpoint = prescriptionId
        ? `${config.API_ENDPOINTS.prescriptions}/${prescriptionId}?userId=${userId}`
        : `${config.API_ENDPOINTS.prescriptions}?userId=${userId}`;

    const prescriptionData = {
        userId: document.getElementById("patientId").value,
        name: document.getElementById("name").value,
        dosage: document.getElementById("dosage").value,
        frequency: document.getElementById("frequency").value,
        milligrams: document.getElementById("milligrams").value,
        refills: document.getElementById("refills").value,
        doctor: document.getElementById("doctor").value,
        phone: document.getElementById("phone").value,
        reason: document.getElementById("reason").value
    };

    fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prescriptionData)
    })

    .then(() => fetchPrescriptions());
});

// Delete a prescription
function deletePrescription(id) {
    fetch(`${config.API_ENDPOINTS.prescriptions}/${id}?userId=${userId}`, {
        method: "DELETE"
    })
.then(() => {
            document.getElementById("prescription-form").reset();
    fetchPrescriptions();
});
}
window.deletePrescription=deletePrescription
