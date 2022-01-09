import React from "react";
import ReactiveButton from "reactive-button";

const Button = (props) => {
  return (
    <ReactiveButton
      {...props}
      color="primary"
      idleText="Simpan"
      loadingText="Diproses"
      successText="Berhasil"
      errorText="Gagal"
      type="button"
      data-bs-dismiss="modal"
      className="btn btn-primary"
    />
  );
};

export default Button;
