import moment from "moment";
import { FaCheck, FaCross, FaCrosshairs, FaTimes } from "react-icons/fa";

export const getMasker = (masker) => {
  return masker ? (
    <FaCheck className="text-success" />
  ) : (
    <FaTimes className="text-danger" />
  );
};

export const formatYMD = (datetime) => {
  return moment(datetime).format("YYYY-MM-DD");
};

export const getNama = (nama) => {
  let splitNama = nama?.split("-");

  if (splitNama?.length > 1) {
    if (splitNama?.[0] == "Tidak dikenal") {
      return "Tidak dikenal";
    }

    return splitNama?.map((d, idx) =>
      idx < 1 ? <b>{d} </b> : <span className="text-muted">- {d}</span>
    );
  }
};

export const getTemperatur = (temperatur) => {
  return `${temperatur?.toFixed(2)} C`;
};

export const getKemiripan = (kemiripan) => {
  return `${kemiripan?.toFixed(2)} %`;
};
