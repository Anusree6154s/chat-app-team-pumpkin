import { api } from "./index";
export const getMessages = async (receiverId: string, senderId: string) => {
  try {
    const data = await api.get(
      `/messages?receiverId=${receiverId}&senderId=${senderId}`
    );
    return data.data;
  } catch (error) {
    console.error(error);
  }
};
