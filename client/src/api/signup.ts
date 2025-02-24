import { api } from "./index";

export const signup = async (form: {
  name: string;
  phone: string;
  email: string;
}) => {
  try {
    const data = await api.post("/signup", form);
    return data.data;
  } catch (error) {
    console.error(error);
  }
};
