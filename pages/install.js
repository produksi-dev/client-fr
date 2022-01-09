import { useRouter } from "next/dist/client/router";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { postProfiles } from "../client/ProfileClient";
import Button from "../components/Button/Button";
import Layout from "../components/Layout/Layout";

const install = () => {
  const router = useRouter();

  const initialFormDataState = {
    name: "",
  };

  const [formDataState, setFormDataState] = useState(initialFormDataState);
  const [buttonState, setButtonState] = useState("idle");

  const _postProfiles = async (e) => {
    e?.preventDefault();

    setButtonState("loading");

    const { data } = await postProfiles(formDataState);

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
            <form onSubmit={_postProfiles}>
              <div className="mb-4">
                <label className="form-label">Nama Sekolah Anda</label>
                <input
                  className="form-control"
                  autoComplete="off"
                  type="text"
                  name="name"
                  value={formDataState.name}
                  onChange={handleChangeForm}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">
                  Link Smarteschool Sekolah Anda
                </label>
                <input
                  className="form-control"
                  autoComplete="off"
                  type="text"
                  name="schoolUrl"
                  value={formDataState.schoolUrl}
                  onChange={handleChangeForm}
                />
              </div>
              <Button buttonState={buttonState} onClick={_postProfiles} />
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default install;
