const config = {
    useRealAPI: true, 
    useServerBackend: false,

    get fetchAddress() {
        return this.useServerBackend
            ? "https://healthcaredbbackendapi.azure-api.net" 
            : "http://localhost:5114";
    },
    
    get API_ENDPOINTS() {
        return this.useRealAPI ? {  
            login: `${this.fetchAddress}/api/auth/login`,
            register: `${this.fetchAddress}/api/auth/register`,
            getUser: `${this.fetchAddress}/api/user/profile`,
            updateUser: `${this.fetchAddress}/api/user/update`,
            messagesBase: `${this.fetchAddress}/api/messages`,
            send: `${this.fetchAddress}/api/messages/send`, 
            message_buttons: `${this.fetchAddress}/UserInfo/GetAll`, 
            prescriptions: `${this.fetchAddress}/api/prescriptions`, 
            getPatientByUserId: "http://localhost:5114/api/patients/byUserId",

            getUserInfo: `${this.fetchAddress}/UserInfo/GetById`,
            updateDoctorInfo: `${this.fetchAddress}/api/UserContact`,
            updatePatientInfo: `${this.fetchAddress}/api/UserContact`,

            getDocAppointments: `${this.fetchAddress}/api/appointments/doctor`,//add /${doctorId}
            getPatientAppointments: `${this.fetchAddress}/api/appointments/user`,//add /${patientId}
            adminAppointments: `${this.fetchAddress}/api/appointments`,// This will be for posting and getting add ${AppointmentId} to delete appointment

        } : {  
            login: "/json/accounts.json",
            register: "/json/accounts.json",
            getUser: "/json/accounts.json",
            updateUser: "/json/accounts.json",
            messagesBase: "/json/messages.json", 
            send: "/json/messages.json",
            message_buttons: "/json/accounts.json",
            prescriptions: "/json/accounts.json",
            updateDoctorInfo: "/json/updateUserInfo.json",
           



        };
    }
};

export default config;
