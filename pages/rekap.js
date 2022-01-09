import { DatePicker, Skeleton } from "antd";
import router from "next/router";
import { useEffect, useState } from "react";
import { FaCloudDownloadAlt, FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";
import { downloadAbsensiFaceRecog, getAbsen } from "../client/AbsenClient";
import { baseURL } from "../client/clientAxios";
import Layout from "../components/Layout/Layout";
import AnimatePage from "../components/Shared/AnimatePage/AnimatePage";
import { momentPackage } from "../utilities/HelperUtils";
import { getPresenceByDate } from "../client/SinkronClient";

const { RangePicker } = DatePicker;

const index = ({ tanggal_awal, tanggal_akhir }) => {
  const initialFormData = {
    tanggal_awal: tanggal_awal
      ? momentPackage(tanggal_awal).startOf("day")
      : momentPackage().startOf("day"),
    tanggal_akhir: tanggal_awal
      ? momentPackage(tanggal_awal).endOf("day")
      : momentPackage().endOf("day"),
  };

  const [formData, setFormData] = useState(initialFormData);
  const [absenData, setAbsenData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const downloadAbsenData = async (rombelId) => {
    if (formData.tanggal_akhir && formData.tanggal_awal) {
      const { data } = await downloadAbsensiFaceRecog({
        role: "siswa",
        tanggal_awal: momentPackage(formData.tanggal_awal).format(
          "YYYY-MM-DD 00:00:00"
        ),
        tanggal_akhir: momentPackage(formData.tanggal_akhir).format(
          "YYYY-MM-DD 23:59:29"
        ),
        rombelId: rombelId,
      });

      if (data) {
        window.open(`${baseURL}/${data}`);
      }
    } else {
      toast.error("Pilih tanggal terlebih dahulu");
    }
  };

  const handleChangeTanggal = (val) => {
    setFormData({
      ...formData,
      tanggal_awal: val[0],
      tanggal_akhir: val[1],
    });
  };

  const handleGetAbsenData = () => {
    setFilter();
  };

  const setFilter = () => {
    router.push({
      pathname: router.pathname,
      query: {
        tanggal_awal: momentPackage(formData.tanggal_awal).format("YYYY-MM-DD"),
        tanggal_akhir: momentPackage(formData.tanggal_akhir).format(
          "YYYY-MM-DD"
        ),
      },
    });
  };

  const [presence, setPresence] = useState([]);

  const _getPresenceByDate = async () => {
    setLoading(true);

    const parameter = {
      tanggal_awal: momentPackage(formData.tanggal_awal).format("YYYY-MM-DD"),
      tanggal_akhir: momentPackage(formData.tanggal_akhir).format("YYYY-MM-DD"),
    };

    const { data } = await getPresenceByDate(parameter);

    if (data) {
      setLoading(false);
      setPresence(data?.data?.presence);
    }
  };

  useEffect(() => {}, []);

  useEffect(() => {
    if (formData.tanggal_akhir > momentPackage().format("YYYY-MM-DD")) {
      toast.error("Data belum tersedia");
      setAbsenData([]);
    } else {
      _getPresenceByDate();
    }
  }, [tanggal_awal, tanggal_akhir]);

  return (
    <Layout>
      <AnimatePage>
        <div className="row">
          <div className="col-lg-12">
            <div className="card card-ss">
              <div className="card-header p-4 card-header-ss">
                <div className="d-flex justify-content-between align-items-md-center flex-md-row flex-column">
                  <h4 className="fw-extrabold color-dark mb-md-0 mb-3">
                    Kehadiran Siswa
                  </h4>
                  <div className="d-flex flex-sm-row flex-column justify-content-md-start justify-content-sm-between justify-content-start">
                    <div
                      className="date-picker-kehadiran d-flex"
                      data-joyride="filter-tanggal"
                    >
                      <RangePicker
                        className="w-100"
                        onChange={(val) => handleChangeTanggal(val)}
                        placeholder="Pilih Tanggal"
                        disabledDate={(current) =>
                          current > momentPackage().endOf("day")
                        }
                        value={[formData.tanggal_awal, formData.tanggal_akhir]}
                      />
                      {/* <DatePicker
                        className="w-100"
                        onChange={handleChangeTanggalAwal}
                        placeholder="Pilih tanggal"
                        value={momentPackage(formData.tanggal_awal)}
                      /> */}
                      <button
                        type="button"
                        className="btn btn-ss btn-primary btn-primary-ss fs-14-ss"
                        onClick={() => {
                          handleGetAbsenData();
                        }}
                      >
                        <FaSearch />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ss btn-outline-secondary btn-outline-secondary-ss rounded-pill fw-semibold color-secondary border border-light-secondary-ss me-sm-3 fs-14-ss mb-sm-0 mb-3 ms-0 ms-sm-2 mt-sm-0 mt-2"
                      onClick={downloadAbsenData}
                      data-joyride="btn-download-rekapan"
                    >
                      <FaCloudDownloadAlt className="me-2 fs-6" />
                      Rekap Absen
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  {loading && <Skeleton count={4} height={50} />}
                  {!loading && (
                    <table className="table-ss" data-joyride="table-kehadiran">
                      <thead>
                        <tr>
                          <th>Nomor</th>
                          <th>Kelas</th>
                          <th>Aksi</th>
                          {/* <th>Hadir</th>
                          <th>Izin</th>
                          <th>Sakit</th>
                          <th>Alpha</th> */}
                        </tr>
                      </thead>
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatePage>
    </Layout>
  );
};

export async function getServerSideProps({
  query: { tanggal_awal, tanggal_akhir },
}) {
  return {
    props: {
      tanggal_awal: tanggal_awal || "",
      tanggal_akhir: tanggal_akhir || "",
    },
  };
}

export default index;
