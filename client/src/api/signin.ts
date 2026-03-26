import { api } from "./index";

export const signin = async (form: {
  name: string;
  phone: string;
  email: string;
}) => {
  try {
    const data = await api.post("/signin", form);
    return data.data;
  } catch (error) {
    console.error(error);
  }
};
