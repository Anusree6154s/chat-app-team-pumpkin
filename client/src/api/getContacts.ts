import { api } from "./index";
export const getContacts = async (userId: string) => {
  try {
    const data = await api.get("/contacts/" + userId);
    return data.data;
  } catch (error) {
    console.error(error);
  }
};
