import { api } from "./index";

export const getUsers = async () => {
  try {
    const data = await api.get("/users");
    return data.data;
  } catch (error) {
    console.error(error);
  }
};
