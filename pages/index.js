import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getCameras, putCameras } from "../client/CameraClient";
import { getBelumSinkron, getLogData, getLogPhoto } from "../client/FRClient";
import Layout from "../components/Layout/Layout";
import { useRouter } from "next/router";
import { getProfiles, getProfilesSession } from "../client/ProfileClient";
import Link from "next/link";
import { postAttendances } from "../client/AttendancesClient";
import { postAbsenFr } from "../client/AbsenClient";

const index = () => {
  const [belumSinkron, setBelumSinkron] = useState([]);

  const router = useRouter();

  const _getProfiles = async () => {
    const { data, status, error } = await getProfiles();

    if (data) {
    } else {
      if (status == 404) {
        toast.error(error.message);
        router.push("/install");
      }
    }
  };

  const [profileSessionState, setProfileSessionState] = useState({});
  const [sessionLoading, setSessionLoading] = useState(true);

  const _getProfilesSession = async () => {
    const { data, status, error } = await getProfilesSession();

    if (data) {
      const { profile } = data;
      setSessionLoading(false);

      setProfileSessionState(profile);
    }
  };

  const _getDataBelumSinkron = async (cam) => {
    const { data, error } = await getBelumSinkron(cam);

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
    }
  };

  const _getLogData = async (cam, totalBelumSinkron) => {
    if (totalBelumSinkron == 0) {
      return;
    }

    const { data, error } = await getLogData(cam, totalBelumSinkron);

    console.log(data);
    return;

    if (data) {
      let faceData = data?.data?.RecognitionRecordList?.RecognitionRecord;

      if (faceData.length > 0) {
        await Promise.all(
          faceData?.map(async (d, idx) => {
            const { data: photoIn } = await getLogPhoto(cam, d);

            // smksiswa16

            if (photoIn) {
              const nameArray = d?.PeopleName?.split("-");

              const payload = {
                photo: photoIn?.data,
                mask: d?.FaceMask == "no" ? 0 : 1,
                temp: d?.FaceTemperature?.Temperature?.toFixed(2),
                whatsapp: nameArray?.[0],
                groupClass: nameArray?.[1],
                name: nameArray?.[2],
                similar: d?.Similar,
                checkTime: moment(d?.Time).format("YYYY-MM-DD HH:mm:ss"),
                ipCamera: cam?.ipCamera,
                camId: cam?.id,
                domain: profileSessionState?.schoolUrl,
              };

              await postAttendances(payload);
              await postAbsenFr(payload);
            }
          })
        );
      } else {
        const { data: photoIn } = await getLogPhoto(cam, faceData);

        if (photoIn) {
          const nameArray = faceData?.PeopleName?.split("-");

          const payload = {
            photo: photoIn?.data,
            mask: faceData?.FaceMask == "no" ? 0 : 1,
            temp: faceData?.FaceTemperature?.Temperature?.toFixed(2),
            whatsapp: nameArray?.[0],
            groupClass: nameArray?.[1],
            name: nameArray?.[2],
            similar: faceData?.Similar,
            checkTime: moment(faceData?.Time).format("YYYY-MM-DD HH:mm:ss"),
            ipCamera: cam?.ipCamera,
            camId: cam?.id,
            domain: profileSessionState?.schoolUrl,
          };

          await postAttendances(payload);
          await postAbsenFr(payload);
        }
      }

      const { data: updateStatus } = await putCameras(cam.id);

      return;
    }
  };

  const [cameras, setCameras] = useState([]);
  const [cameraLoading, setCameraLoading] = useState(true);

  const _getCameras = async () => {
    const { data, error } = await getCameras();

    if (data) {
      const { camera } = data;
      setCameraLoading(false);
      setCameras(camera);
      camera?.map((cam) => {
        _getDataBelumSinkron(cam);
      });
    }
  };

  useEffect(() => {
    _getProfiles();
  }, []);

  useEffect(() => {
    setInterval(() => {
      _getProfilesSession();
    }, 5000);
  }, []);

  useEffect(() => {
    if (profileSessionState?.message == "WhatsApp berhasil terhubung") {
      _getCameras();
    }
  }, [profileSessionState]);

  return (
    <Layout>
      {profileSessionState?.message == "WhatsApp berhasil terhubung" ? (
        <div className="container">
          <div className="card">
            <div className="card-body p-0">
              <div className="d-flex justify-content-between align-items-center">
                <h2>List Kamera</h2>
                <Link href="/add-camera">
                  <a className="btn btn-primary rounded-pill">Tambah Kamera</a>
                </Link>
              </div>
              {cameraLoading ? (
                "Loading..."
              ) : (
                <table className="table-ss">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>IP Camera</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cameras?.map((d, idx) => (
                      <tr key={idx}>
                        <td data-th="No">1</td>
                        <td data-th="IP Camera">{d?.ipCamera}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ) : sessionLoading ? (
        <div className="container">Menghubungkan...</div>
      ) : (
        <div className="container">
          <figure className="figure">
            <img
              src={profileSessionState?.qrUrl}
              alt={profileSessionState?.message}
              className="figure-img img-fluid rounded"
            />
            <figcaption className="figure-caption">
              {profileSessionState?.message}
            </figcaption>
          </figure>
        </div>
      )}
    </Layout>
  );
};

export default index;
