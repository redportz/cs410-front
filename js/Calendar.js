import config from "./config.js";

// Get user info from localStorage
const userId = parseInt(localStorage.getItem("userId"));
const role = localStorage.getItem("userRole");
let calendar;

// Fetch doctors
async function fetchDoctors() {
    try {
        const response = await fetch(`${config.API_ENDPOINTS.message_buttons}?currentUserId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch users');
        const users = await response.json();

        

        return users.filter(user => user.role === "Doctor");
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return [];
    }
}
window.fetchDoctors = fetchDoctors;

// Fetch patients (for admin)
async function fetchPatients() {
    try {
        const response = await fetch(`${config.API_ENDPOINTS.message_buttons}?currentUserId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch users');
        const users = await response.json();
        return users.filter(user => user.role === "Patient");
    } catch (error) {
        console.error("Error fetching patients:", error);
        return [];
    }
}
window.fetchPatients = fetchPatients;

// Fetch appointments for patient
async function getAppointmentsByPatient(userId) {
    try {
        const res = await fetch(`${config.API_ENDPOINTS.getPatientAppointments}/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch appointments");
        const appointments = await res.json();
        return appointments;
    } catch (error) {
        console.error("Error loading appointments:", error);
        return [];
    }
}
window.getAppointmentsByPatient = getAppointmentsByPatient;

async function getAppointmentsByDoctor(doctorId) {
    try {
        const res = await fetch(`${config.API_ENDPOINTS.getDocAppointments}/${doctorId}`);
        if (!res.ok) throw new Error("Failed to fetch doctor appointments");
        const appointments = await res.json();
        return appointments;
    } catch (error) {
        console.error("Error loading doctor's appointments:", error);
        return [];
    }
}

window.getAppointmentsByDoctor=getAppointmentsByDoctor

// Delete appointment
async function deleteAppointment(appointmentId) {
    try {
        const res = await fetch(`${config.API_ENDPOINTS.adminAppointments}/${appointmentId}`, {
            method: "DELETE"
        });

        return res.ok;
    } catch (error) {
        console.error("Error deleting appointment:", error);
        return false;
    }
}
window.deleteAppointment = deleteAppointment;

// Create appointment
async function createAppointment(appointmentData) {
    try {
        const res = await fetch(`${config.API_ENDPOINTS.adminAppointments}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(appointmentData)
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Error response:", errorText);
            throw new Error("Failed to create appointment");
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error creating appointment:", error);
        return null;
    }
}
window.createAppointment = createAppointment;

// Populate dropdown
function populateDropdown(selectId, users) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">Select</option>';

    users.forEach(user => {
        const option = document.createElement("option");
        option.value = user.userId;
        option.textContent = `${user.firstName} ${user.lastName}`;
        select.appendChild(option);
    });
}

// Show create appointment popup
async function openNewPopup(date) {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("appointment-date").setAttribute("min", today);
    document.getElementById("edit-appointment-date").setAttribute("min", today);

    document.getElementById("appointment-popup").style.display = "block";
    document.getElementById("appointment-form").setAttribute("data-mode", "new");
    document.getElementById("appointment-date").value = date;
    document.getElementById("appointment-reason").value = "";

    const doctorSelect = document.getElementById("appointment-doctor");
    const patientSelect = document.getElementById("appointment-patient");

    // Clear and disable time dropdown until loaded
    const timeSelect = document.getElementById("appointment-time");
    timeSelect.innerHTML = `<option>Loading...</option>`;
    timeSelect.disabled = true;

    // Role logic
    if (role === "Admin") {
        const [doctors, patients] = await Promise.all([
            fetchDoctors(),
            fetchPatients()
        ]);
        populateDropdown("appointment-doctor", doctors);
        populateDropdown("appointment-patient", patients);
        document.querySelectorAll(".admin-only").forEach(el => el.classList.remove("hidden"));
    } else {
        const doctors = await fetchDoctors();
        populateDropdown("appointment-doctor", doctors);
        if (patientSelect) patientSelect.classList.add("hidden");
    }
    const availableTimes = await getAvailableTimesForDate(date);
    populateTimeDropdown("appointment-time", availableTimes);
    timeSelect.disabled = false;
}



async function openEditPopup(event) {
    const popup = document.getElementById("edit-appointment-popup");
    const today = new Date().toISOString().split("T")[0];

    // Set date picker minimum
    document.getElementById("edit-appointment-date").setAttribute("min", today);

    // Set the appointment ID
    popup.setAttribute("data-appointment-id", event.id);

    // Safely parse date and time
    const fullDate = event.startStr || event.start?.toISOString();
    const dateStr = fullDate ? fullDate.split("T")[0] : today;
    const timeStr = fullDate && fullDate.includes("T") ? fullDate.split("T")[1].substring(0, 5) : "09:00";

    // Populate form fields
    document.getElementById("edit-appointment-date").value = dateStr;
    document.getElementById("edit-appointment-reason").value = event.title || "";

    const availableTimes = await getAvailableTimesForDate(dateStr);
    populateTimeDropdown("edit-appointment-time", availableTimes);

    document.getElementById("edit-appointment-time").value = timeStr;

    // Show popup
    popup.style.display = "block";

    // Save changes
    document.getElementById("save-edit-btn").onclick = async function () {
        const appointmentId = popup.getAttribute("data-appointment-id");
        const reason = document.getElementById("edit-appointment-reason").value;
        const date = document.getElementById("edit-appointment-date").value;
        const time = document.getElementById("edit-appointment-time").value;

        let doctorId;

        let appointments = [];

        if (role === "Admin") {
            try {
                const res = await fetch(config.API_ENDPOINTS.adminAppointments);
                if (!res.ok) throw new Error("Failed to fetch all appointments");
                appointments = await res.json();
                console.log("Admin appointments:", appointments);
            } catch (err) {
                console.error("Error fetching admin appointments:", err);
            }
        }else {
            appointments = await getAppointmentsByPatient(userId);
            const matched = appointments.find(a => a.appointmentId == appointmentId);
            if (matched) doctorId = matched.doctorId;
        }

        if (!doctorId || !userId) {
            alert("Missing doctor or patient ID.");
            return;
        }

        const appointmentData = {
            appointmentDate: `${date}T${time}:00`,
            reason,
            userId,
            doctorId
        };

        try {
            const res = await fetch(`${config.API_ENDPOINTS.adminAppointments}/${appointmentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(appointmentData)
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Update error:", errorText);
                alert("Failed to update appointment.");
                return;
            }

            const updatedEvent = calendar.getEventById(appointmentId);
            if (updatedEvent) {
                updatedEvent.setProp("title", reason);
                updatedEvent.setStart(`${date}T${time}:00`);
            }

            popup.style.display = "none";
        } catch (err) {
            console.error("Error updating appointment:", err);
            alert("Error updating appointment.");
        }
    };

    // Delete button
    document.getElementById("delete-btn").onclick = async function () {
        const appointmentId = popup.getAttribute("data-appointment-id");

        if (!appointmentId) {
            alert("No appointment selected.");
            return;
        }

        const confirmDelete = confirm("Are you sure you want to delete this appointment?");
        if (!confirmDelete) return;

        const success = await deleteAppointment(appointmentId);
        if (success) {
            const eventToRemove = calendar.getEventById(appointmentId);
            if (eventToRemove) eventToRemove.remove();
            popup.style.display = "none";
        } else {
            alert("Failed to delete appointment.");
        }
    };
}


window.openEditPopup = openEditPopup;

async function getAvailableTimesForDate(date) {
    const allTimes = [
        "09:00", "10:00", "11:00",
        "13:00", "14:00", "15:00", "16:00", "17:00"
    ];

    try {
        let appointments = [];

        // Admin fetches ALL appointments
        if (role === "Admin") {
            const res = await fetch(config.API_ENDPOINTS.adminAppointments);
            if (!res.ok) throw new Error("Failed to fetch all appointments");
            appointments = await res.json();
        } else {
            appointments = await getAppointmentsByPatient(userId);
        }

        const bookedTimes = appointments
            .filter(a => a.appointmentDate.startsWith(date))
            .map(a => a.appointmentDate.split("T")[1].substring(0, 5));

        return allTimes.filter(t => !bookedTimes.includes(t));
    } catch (err) {
        console.error("Error getting available times:", err);
        return allTimes;
    }
}

window.getAvailableTimesForDate= getAvailableTimesForDate

function formatTimeDisplay(timeStr) {
    const [hour, minute] = timeStr.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = ((hour + 11) % 12 + 1); // Converts 13 -> 1, 0 -> 12
    return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
}

function populateTimeDropdown(selectId, times) {
    const select = document.getElementById(selectId);
    select.innerHTML = "";

    if (times.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "No available times";
        option.disabled = true;
        select.appendChild(option);
        return;
    }

    times.forEach(time => {
        const option = document.createElement("option");
        option.value = time;
        option.textContent = formatTimeDisplay(time);
        select.appendChild(option);
    });
}

window.populateDropdown=populateDropdown;

// Main calendar setup
document.addEventListener("DOMContentLoaded", async function () {
    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) {
        console.error("Calendar element not found");
        return;
    }
    const newAppointmentDateInput = document.getElementById("appointment-date");
    newAppointmentDateInput.addEventListener("change", async function () {
        const selectedDate = this.value;
        const availableTimes = await getAvailableTimesForDate(selectedDate);
        populateTimeDropdown("appointment-time", availableTimes);
    });

    // For the edit appointment popup:
    const editAppointmentDateInput = document.getElementById("edit-appointment-date");
    editAppointmentDateInput.addEventListener("change", async function () {
        const selectedDate = this.value;
        const availableTimes = await getAvailableTimesForDate(selectedDate);
        populateTimeDropdown("edit-appointment-time", availableTimes);
    });


    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        headerToolbar: {
            right:"prev,today,next"
        },
        selectable: role !== "Doctor",
        editable: false,
        weekends: false,

        minTime: "09:00:00",
        maxTime: "17:00:00",
        eventClick: function (info) {
            if (role !== "Doctor") openEditPopup(info.event);
        },
        dateClick: function (info) {
            if (role !== "Doctor") openNewPopup(info.dateStr);
        }        
    });
    
    

// fetch appointments depending on role
let appointments = [];

if (role === "Admin") {
    try {
        const res = await fetch(config.API_ENDPOINTS.adminAppointments);
        if (!res.ok) throw new Error("Failed to fetch admin appointments");
        appointments = await res.json();
        console.log("Admin appointments loaded:", appointments);
    } catch (err) {
        console.error("Admin load error:", err);
    }
} else if (role === "Doctor") {
    appointments = await getAppointmentsByDoctor(userId); 
} else {
    appointments = await getAppointmentsByPatient(userId);
}

// Add appointments to the calendar
appointments.forEach(appointment => {
    calendar.addEvent({
        id: appointment.appointmentId,
        title: appointment.reason || "No reason",
        start: appointment.appointmentDate
    });
});


    


    calendar.render();

    // Close popups
    document.querySelectorAll(".close-popup").forEach(btn => {
        btn.addEventListener("click", () => {
            document.getElementById("appointment-popup").style.display = "none";
            document.getElementById("edit-appointment-popup").style.display = "none";
        });
    });

    // Submit form
    document.getElementById("appointment-form").addEventListener("submit", async function (event) {
        event.preventDefault();

        const reason = document.getElementById("appointment-reason").value;
        const date = document.getElementById("appointment-date").value;
        const time = document.getElementById("appointment-time").value;

        const doctorId = parseInt(document.getElementById("appointment-doctor").value);
        if (!doctorId) return alert("Please select a doctor.");


        let selectedUserId = userId;
        if (role === "Admin") {
            const patientSelect = document.getElementById("appointment-patient");
            selectedUserId = parseInt(patientSelect.value);
            if (!selectedUserId) return alert("Please select a patient.");
        }



        const appointmentData = {
            appointmentDate: `${date}T${time}:00`,
            reason: reason,
            userId: selectedUserId,
            doctorId: doctorId
          };

        const saved = await createAppointment(appointmentData);

        if (saved && saved.appointmentId) {
            calendar.addEvent({
                id: saved.appointmentId,
                title: saved.reason,
                start: saved.appointmentDate
            });
            document.getElementById("appointment-popup").style.display = "none";
        } else {
            alert("Failed to save appointment.");
        }     
           
    });
    document.addEventListener("click", function (event) {
        const newPopup = document.getElementById("appointment-popup");
        const editPopup = document.getElementById("edit-appointment-popup");
    
        // Check if new appointment popup is open and click is outside
        if (newPopup.style.display === "block" && !newPopup.querySelector(".popup-content").contains(event.target)) {
            newPopup.style.display = "none";
        }
    
        // Check if edit appointment popup is open and click is outside
        if (editPopup.style.display === "block" && !editPopup.querySelector(".popup-content").contains(event.target)) {
            editPopup.style.display = "none";
        }
    });
    
    flatpickr("#appointment-date", {
        dateFormat: "Y-m-d",
        minDate: "today",
        disable: [
            function (date) {
                // Disable Saturdays (6) and Sundays (0)
                return (date.getDay() === 0 || date.getDay() === 6);
            }
        ]
    });

    flatpickr("#edit-appointment-date", {
        dateFormat: "Y-m-d",
        minDate: "today",
        disable: [
            function (date) {
                return (date.getDay() === 0 || date.getDay() === 6);
            }
        ]
    });
});


