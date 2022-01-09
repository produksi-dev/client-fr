import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  FaExternalLinkAlt,
  FaMarsStroke,
  FaMask,
  FaPlus,
  FaTemperatureHigh,
  FaTrash,
  FaWhatsapp,
} from "react-icons/fa";
import TimePicker from "react-time-picker/dist/entry.nostyle";
import { toast } from "react-toastify";
import ReactiveButton from "reactive-button";
import swal from "sweetalert";
import {
  deleteCamera,
  getCamera,
  postCamera,
  putCamera,
} from "../client/CameraClient";
import { baseURL } from "../client/clientAxios";
import {
  getBelumSinkron,
  getLogData,
  getLogPhoto,
  getPresence,
  postPresence,
} from "../client/SinkronClient";
import Layout from "../components/Layout/Layout";
import AnimatePage from "../components/Shared/AnimatePage/AnimatePage";
import NewModal from "../components/Shared/NewModal/NewModal";
import {
  getKemiripan,
  getMasker,
  getNama,
  getTemperatur,
} from "../utilities/app-helper";
import { hideModal } from "../utilities/ModalUtils";

const index = () => {
  const initialState = {
    ipCam: "",
    checkIn: "07:00",
    checkOut: "12:00",
  };
  const [formData, setFormData] = useState(initialState);
  const [formButton, setFormButton] = useState("idle");
  const [belumSinkron, setBelumSinkron] = useState([]);

  const _getCamera = async () => {
    // const { data, error } = await getCamera();

    // if (data) {
    [{ ipCam: "http://192.168.1.19" }].map((cam) => {
      _getDataBelumSinkron(cam);
    });
    // }
  };

  const _getDataBelumSinkron = async (cam) => {
    const { data, error } = await getBelumSinkron(cam);

    console.log(data);

    return;

    if (data) {
      setBelumSinkron([
        ...belumSinkron.filter((item) => item.id != cam.id),
        {
          ...cam,
          jumlah: data.data?.FaceRecognition?.RecognitionRecordCount,
        },
      ]);

      if (data.data?.FaceRecognition?.RecognitionRecordCount > 0) {
        _getLogData(cam, data.data?.FaceRecognition?.RecognitionRecordCount);
      }

      setTimeout(() => {
        _getCamera();
      }, 7000);
    }
  };

  const _getLogData = async (cam, totalBelumSinkron) => {
    if (totalBelumSinkron == 0) {
      return;
    }

    const { data, error } = await getLogData(cam, totalBelumSinkron);

    if (data) {
      let faceData = data?.data?.RecognitionRecordList?.RecognitionRecord;

      if (faceData.length > 0) {
        await Promise.all(
          faceData?.map(async (d, idx) => {
            const { data: photoIn } = await getLogPhoto(cam, d);

            if (photoIn) {
              await postPresence({
                photoIn: photoIn?.data,
                maskIn: d?.FaceMask == "no" ? 0 : 1,
                temperatureIn: d?.FaceTemperature?.Temperature,
                displayName: d?.PeopleName,
                similarIn: d?.Similar,
                checkIn: moment(d?.Time).format("YYYY-MM-DD HH:mm:ss"),
                cameraId: cam.id,
              });
            }
          })
        );
      } else {
        const { data: photoIn } = await getLogPhoto(cam, faceData);

        if (photoIn) {
          await postPresence({
            photoIn: photoIn?.data,
            maskIn: faceData?.FaceMask == "no" ? 0 : 1,
            temperatureIn: faceData?.FaceTemperature?.Temperature,
            displayName: faceData?.PeopleName,
            similarIn: faceData?.Similar,
            checkIn: moment(faceData?.Time).format("YYYY-MM-DD HH:mm:ss"),
            cameraId: cam.id,
          });
        }
      }

      const { data: updateStatus } = await putCamera(cam.id);

      if (updateStatus) {
        _getPresence();
      }

      return;
    }
  };

  const _postCamera = async () => {
    if (!formData.ipCam.includes("http://")) {
      toast.error("format Alamat salah");
      return;
    }

    setFormButton("loading");

    const { data, error } = await postCamera({ ...formData });

    if (data) {
      toast.success(data.message);
      hideModal("modalTambahKamera");
      setFormButton("success");
      _getCamera();
    } else {
      setFormButton("error");
      toast.error(error?.[0]?.message);
    }
  };

  const _deleteCamera = (id) => {
    swal({
      title: "Yakin ingin dihapus?",
      text: "Pastikan data yang ingin anda hapus adalah benar!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        const { data, error } = await deleteCamera(id);
        if (data) {
          toast.success(data?.message);

          setBelumSinkron([...belumSinkron.filter((item) => item.id != id)]);
        } else {
          toast.error(error?.message);
        }
      }
    });
  };

  const handleChangeForm = (e, name) => {
    if (name) {
      setFormData({
        ...formData,
        [name]: e,
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const [presence, setPresence] = useState([]);

  const _getPresence = async () => {
    const { data } = await getPresence();

    if (data) {
      setPresence(data?.data?.presence);
    }
  };

  useEffect(() => {
    _getCamera();
    _getPresence();
  }, []);

  const [checkServer, setCheckServer] = useState(false);

  const _testAuthWhatsApp = async () => {
    const data = axios
      .post(
        `http://localhost:8000/send-message`,
        {
          number: `081316119411@c.us`,
          message: `Server WhatsApp sudah siap`,
        },
        { timeout: 5000 }
      )
      .then((res) => {
        setCheckServer(true);
      })
      .catch((err) => {
        if (err.code == "ECONNABORTED") {
          setCheckServer(false);
          toast.error("Pastikan server WhatsApp dinyalakan");
        }
      });
  };

  useEffect(() => {
    _testAuthWhatsApp();
  }, []);

  return (
    <Layout
      modalWrapper={
        <NewModal
          modalId="modalTambahKamera"
          title={
            <>
              <h4 className="mb-1 fw-extrabold">Kamera</h4>
              <span className="fs-6 fw-normal">
                Dibawah ini adalah keterangan Kamera
              </span>
            </>
          }
          content={
            <>
              <div className="mb-4">
                <label className="form-label">Jam Masuk</label>
                <div className="d-flex align-items-center">
                  <TimePicker
                    onChange={(value) => handleChangeForm(value, "checkIn")}
                    value={formData.checkIn}
                  />{" "}
                  <span>Pagi - Siang (AM)</span>
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label">Jam Pulang</label>
                <div className="d-flex align-items-center">
                  <TimePicker
                    onChange={(value) => handleChangeForm(value, "checkOut")}
                    value={formData.checkOut}
                  />{" "}
                  <span>Siang - Malam (PM)</span>
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label">Alamat Kamera</label>
                <input
                  className="form-control"
                  autoComplete="off"
                  placeholder="Contoh: http://192.168.137.29"
                  type="text"
                  name="ipCam"
                  value={formData?.ipCam}
                  onChange={handleChangeForm}
                />
              </div>
            </>
          }
          submitButton={
            <ReactiveButton
              buttonState={formButton}
              color={"primary"}
              idleText={"Buat"}
              loadingText={"Diproses"}
              successText={"Berhasil"}
              errorText={"Gagal"}
              type={"button"}
              data-bs-dismiss="modal"
              className={"btn btn-primary"}
              onClick={() => _postCamera()}
            />
          }
        />
      }
    >
      <AnimatePage>
        <>
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0">Live Streaming</h4>
              <div className="d-flex">
                {checkServer ? null : (
                  <a
                    href="http://localhost:8000"
                    className="btn btn-success btn-ss btn-success-ss rounded-pill d-flex align-items-center"
                  >
                    <FaWhatsapp className="me-2" /> Server WhatsApp
                  </a>
                )}

                <button
                  data-bs-toggle="modal"
                  data-bs-target="#modalTambahKamera"
                  onClick={() => {
                    setFormData(initialState);
                  }}
                  className="btn btn-primary btn-ss btn-primary-ss rounded-pill d-flex align-items-center"
                >
                  <FaPlus className="me-2" /> Tambah Camera
                </button>
              </div>
            </div>
            {/* <div className="row">
              {belumSinkron?.map((item) => {
                return (
                  <div className="col-md-6 col-lg-4">
                    <figure className="figure">
                      <img
                        loading="lazy"
                        id={`cam-${item.id}`}
                        className="figure-img img-fluid rounded"
                        src={`${item.ipCam}/Streams/1/4/ReceiveData`}
                        alt="Offline"
                      />
                      <figcaption className="figure-caption d-flex justify-content-between align-items-center">
                        <a
                          href={item.ipCam}
                          target="_blank"
                          className="d-flex align-items-center btn btn-sm btn-primary btn-primary-ss"
                        >
                          <FaExternalLinkAlt className="me-2" /> {item.ipCam}
                        </a>
                        <button
                          className="btn btn-sm btn-danger btn-danger-ss"
                          onClick={() => _deleteCamera(item.id)}
                        >
                          <FaTrash />
                        </button>
                      </figcaption>
                    </figure>
                  </div>
                );
              })}
            </div> */}
          </div>

          <div className="table-responsive">
            <table className="table-ss">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Foto Masuk</th>
                  <th>Foto Pulang</th>
                  <th>Nama</th>
                  <th>Waktu Masuk</th>
                  <th>Waktu Pulang</th>
                </tr>
              </thead>
              <tbody>
                {presence?.data?.map((d, idx) => (
                  <tr key={idx}>
                    <td data-th="No">{idx + 1}</td>
                    <td data-th="Foto Masuk">
                      <figure className="figure">
                        <img
                          loading="lazy"
                          className="figure-img img-fluid rounded"
                          src={`${baseURL}/uploads/${d.photoIn}`}
                          alt={d.displayName}
                          width="200px"
                        />
                        <div className="bg-success text-white text-center">
                          {getKemiripan(d.similarIn)}
                        </div>
                        <figcaption className="figure-caption d-flex justify-content-between align-items-center">
                          <span>Masker = {getMasker(d.maskIn)}</span>
                          <span className="text-danger">
                            <FaTemperatureHigh />{" "}
                            {getTemperatur(d.temperatureIn)}
                          </span>
                        </figcaption>
                      </figure>
                    </td>
                    <td data-th="Foto Pulang">
                      <figure className="figure">
                        <img
                          loading="lazy"
                          className="figure-img img-fluid rounded"
                          src={`${baseURL}/uploads/${d.photoOut}`}
                          alt={d.displayName}
                          width="200px"
                        />
                        <div className="bg-success text-white text-center">
                          {getKemiripan(d.similarOut)}
                        </div>
                        <figcaption className="figure-caption d-flex justify-content-between align-items-center">
                          <span>Masker = {getMasker(d.maskOut)}</span>
                          <span className="text-danger">
                            <FaTemperatureHigh />{" "}
                            {getTemperatur(d.temperatureOut)}
                          </span>
                        </figcaption>
                      </figure>
                    </td>
                    <td data-th="Nama">{getNama(d.displayName)}</td>
                    <td data-th="Waktu Masuk">{d.checkIn}</td>
                    <td data-th="Waktu Pulang">{d.checkOut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      </AnimatePage>
    </Layout>
  );
};

export default index;
