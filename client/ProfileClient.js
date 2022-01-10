import client from "./ApiClient";

export const postProfilesListen = (payload) => {
  return client("profiles/listen", {
    method: "POST",
    body: payload,
  });
};

export const getProfilesSession = () => {
  return client("profiles/session");
};

export const postProfiles = (payload) => {
  return client("profiles", {
    method: "POST",
    body: payload,
  });
};

export const editProfiles = (id, payload) => {
  return client(`profiles/${id}`, {
    method: "PUT",
    body: payload,
  });
};

export const deleteProfiles = (id) => {
  return client(`profiles/${id}`, {
    method: "DELETE",
  });
};
