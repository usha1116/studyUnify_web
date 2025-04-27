import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
console.log("API BASE URL:", BASE_URL); 

export const sendContactEmail = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/send/email`, {
      name: formData.name,
      email: formData.email,
      subject: "User Inquiry",
      message: formData.message,
    });

    return { success: true, message: response.data.message };
  } catch (error) {
    console.error("API Error:", error);

    return {
      success: false,
      message: error.response?.data?.message || error.message || "Something went wrong. Please try again.",
    };
  }
};
