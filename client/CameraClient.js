import client from "./ApiClient";

export const getCameras = () => {
  return client("cameras");
};

export const postCameras = (payload) => {
  return client("cameras", {
    method: "POST",
    body: payload,
  });
};

export const putCameras = (id, payload) => {
  return client(`cameras/${id}`, {
    method: "PUT",
    body: payload,
  });
};

export const deleteCameras = (id) => {
  return client(`cameras/${id}`, {
    method: "DELETE",
  });
};
