import React, { useEffect, useState } from "react";
import { FaDownload, FaSync } from "react-icons/fa";
import { getPresenceGroupDate } from "../client/SinkronClient";
import Layout from "../components/Layout/Layout";
import AnimatePage from "../components/Shared/AnimatePage/AnimatePage";
import { formatYMD } from "../utilities/app-helper";

const download = () => {
  const [presenceGroupDate, setPresenceGroupDate] = useState([]);

  const _getPresenceGroupDate = async () => {
    const { data } = await getPresenceGroupDate();

    if (data) {
      setPresenceGroupDate(data?.data?.presence);
    }
  };

  useEffect(() => _getPresenceGroupDate(), []);

  return (
    <Layout>
      <AnimatePage>
        <h1>Download and Sync</h1>
        <div className="table-responsive">
          <table className="table-ss">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Download</th>
                <th>Sync</th>
                <th>Last Sync</th>
              </tr>
            </thead>
            <tbody>
              {presenceGroupDate?.map((d, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{formatYMD(d.checkIn)}</td>
                  <td>
                    <button className="btn btn-secondary rounded-pill">
                      <FaDownload />
                    </button>
                  </td>
                  <td>
                    <button className="btn btn-primary rounded-pill">
                      <FaSync />
                    </button>
                  </td>
                  <td>{formatYMD(d.checkIn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatePage>
    </Layout>
  );
};

export default download;
