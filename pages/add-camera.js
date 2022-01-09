import { useRouter } from "next/dist/client/router";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { postCameras } from "../client/CameraClient";
import Button from "../components/Button/Button";
import Layout from "../components/Layout/Layout";

const addCamera = () => {
  const router = useRouter();

  const initialFormDataState = {
    ipCamera: "",
    checkIn: "",
    checkOut: "",
  };

  const [formDataState, setFormDataState] = useState(initialFormDataState);
  const [buttonState, setButtonState] = useState("idle");

  const _postCameras = async (e) => {
    e?.preventDefault();

    setButtonState("loading");

    const { data } = await postCameras(formDataState);

    if (data) {
      router.push("/");
      toast.success(data?.message);
      setButtonState("success");
      setFormDataState(initialFormDataState);
    } else {
      setButtonState("error");
    }
  };

  const handleChangeForm = (e) => {
    setFormDataState({
      ...formDataState,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Layout>
      <div className="container">
        <h1>
          Hubungkan dengan Smarteschool <br />{" "}
          <span className="text-muted">Sekolah Anda</span>
        </h1>

        <div className="card">
          <div className="card-body">
            <form onSubmit={_postCameras}>
              <div className="mb-4">
                <label className="form-label">IP Camera</label>
                <input
                  className="form-control"
                  autoComplete="off"
                  type="text"
                  name="ipCamera"
                  value={formDataState.ipCamera}
                  onChange={handleChangeForm}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">Password Camera</label>
                <input
                  className="form-control"
                  autoComplete="off"
                  type="text"
                  name="password"
                  value={formDataState.password}
                  onChange={handleChangeForm}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">Jam Masuk</label>
                <input
                  className="form-control"
                  autoComplete="off"
                  type="time"
                  name="checkIn"
                  value={formDataState.checkIn}
                  onChange={handleChangeForm}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">Jam Pulang</label>
                <input
                  className="form-control"
                  autoComplete="off"
                  type="time"
                  name="checkOut"
                  value={formDataState.checkOut}
                  onChange={handleChangeForm}
                />
              </div>
              <Button buttonState={buttonState} onClick={_postCameras} />
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default addCamera;
