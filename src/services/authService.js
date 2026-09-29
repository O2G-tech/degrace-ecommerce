import API from "./api";

export const register = async (userData) => {

    const response = await API.post(
        "/auth/register.php",
        userData
    );

    return response.data;
};


export const login = async (loginData) => {

    const response = await API.post(
        "/auth/login.php",
        loginData
    );

    return response.data;
};


export const getCurrentUser = async () => {

    const response = await API.get(
        "/auth/user.php"
    );

    return response.data;
};


export const logout = async () => {

    const response = await API.post(
        "/auth/logout.php"
    );

    return response.data;
};


export const updateProfile = async (profileData) => {

    const response = await API.put(
        "/auth/update-profile.php",
        profileData
    );

    return response.data;
};




export const forgotPassword = async (email) => {

    const response = await API.post(
        "/auth/forgot-password.php",
        {
            email: email
        }
    );

    return response.data;
};


export const resetPassword = async (data) => {

    const response = await API.post(
        "/auth/reset-password.php",
        data
    );

    return response.data;
};