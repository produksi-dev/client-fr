import client from "./ApiClient";

export const getCamera = () => {
  return client("camera");
};

export const postCamera = (body) => {
  return client("camera", {
    method: "POST",
    body: body,
  });
};

export const putCamera = (id, body) => {
  return client(`camera/${id}`, {
    method: "PUT",
    body: body,
  });
};

export const deleteCamera = (id) => {
  return client(`camera/${id}`, {
    method: "DELETE",
  });
};
