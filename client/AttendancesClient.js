import client from "./ApiClient";

export const getAttendances = () => {
  return client("attendances");
};

export const getAttendancesGroupDate = () => {
  return client("attendances/group-date");
};

export const getAttendancesByDate = () => {
  return client("attendances/by-date");
};

export const postAttendances = (data) => {
  return client("attendances", {
    method: "POST",
    body: data,
  });
};
