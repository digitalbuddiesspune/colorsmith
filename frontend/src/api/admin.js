import client from './client.js';



export const adminApi = {
  login: (email, password) => client.post(`/admin-login`, { email, password }),
  createAdmin: (data) => client.post(`/create-admin`, data),
  getAdmins: () => client.get(`/get-admins`),
  updateAdmin: (id, data) => client.put(`/update-admin/${id}`, data),
  deleteAdmin: (id) => client.delete(`/delete-admin/${id}`),
};

export default adminApi;
