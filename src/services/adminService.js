import API from "./api";

export const adminLogin = async (email, password) => {
    const response = await API.post("/admin/login.php", {
        email,
        password
    });

    return response.data;
};

export const getAdminDashboard = async () => {
    const response = await API.get("/admin/dashboard.php");

    return response.data;
};

export const getAdminReports = async (period = "30") => {
    const response = await API.get("/admin/reports.php", {
        params: { period }
    });

    return response.data;
};