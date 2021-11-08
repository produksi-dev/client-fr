import axios from "axios";
import { camelizeKeys, decamelizeKeys } from "humps";
import parser from "fast-xml-parser";
import moment from "moment";
import client from "./ApiClient";

const onError = (err) => {
  let error = err?.response?.data;
  console.log(err);
  error = camelizeKeys(error);

  return {
    isSuccess: false,
    data: err?.data,
    error,
    status: err?.response?.status,
  };
};

export const getBelumSinkron = (data) => {
  return axios({
    method: "POST",
    url: "/api/cors",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      url: `${data?.ipCam}/FaceRecognition/QueryRecordCount`,
      method: "PUT",
      headers: {
        Authorization: "Basic YWRtaW46c21hcnRmcg==",
      },
      data: `<?xml version='1.0' encoding='UTF-8' ?>
    <FaceRecognitionFilter>
        <GroupID>-1</GroupID>
        <PeopleName></PeopleName>
        <StartTime>${moment(data?.lastSync).format(
          "YYYYMMDDTHHmmss"
        )}</StartTime>
        <StopTime>${moment().format("YYYYMMDDTHHmmss")}</StopTime>
        <RecognitionResultType>all</RecognitionResultType>
        <RuleID>-1</RuleID>
    </FaceRecognitionFilter>`,
    },
  })
    .then((res) => {
      return {
        isSuccess: true,
        error: false,
        data: res.data,
        status: res?.status,
      };
    })
    .catch(onError);
};

export const getLogData = (camera, size, page) => {
  return axios({
    method: "POST",
    url: "/api/cors",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      url: `${camera?.ipCam}/FaceRecognition/QueryRecordList`,
      method: "PUT",
      headers: {
        Authorization: "Basic YWRtaW46c21hcnRmcg==",
      },
      data: `<?xml version='1.0' encoding='UTF-8' ?>
    <FaceRecognitionFilter>
        <GroupID>-1</GroupID>
        <PeopleName></PeopleName>
        <StartTime>${moment(camera?.lastSync).format(
          "YYYYMMDDTHHmmss"
        )}</StartTime>
        <StopTime>${moment().format("YYYYMMDDTHHmmss")}</StopTime>
        <Pagesize>${size}</Pagesize>
        <Pagenum>${page || 1}</Pagenum>
        <IsHasPath></IsHasPath>
        <RecognitionResultType>all</RecognitionResultType>
        <RuleID>-1</RuleID>
    </FaceRecognitionFilter>`,
    },
  })
    .then((res) => {
      return {
        isSuccess: true,
        error: false,
        data: res.data,
        status: res?.status,
      };
    })
    .catch(onError);
};

export const getLogPhoto = (camera, faceData) => {
  return axios({
    method: "POST",
    url: "/api/cors",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      url: `${camera?.ipCam}/FaceRecognition/SnapshotByRecognitionRecord`,
      method: "POST",
      headers: {
        Authorization: "Basic YWRtaW46c21hcnRmcg==",
      },
      responseType: "arraybuffer",
      data: `<?xml version='1.0' encoding='UTF-8' ?><RecognitionInfo><SnapshotPath>${faceData?.SnapshotPath}</SnapshotPath></RecognitionInfo>`,
    },
  }).then(async (res) => {
    console.log(res);
    return {
      isSuccess: true,
      error: false,
      data: res.data,
      status: res?.status,
    };
  });
};

export const getPresence = () => {
  return client("presence");
};

export const getPresenceGroupDate = () => {
  return client("presence/group-date");
};

export const postPresence = (data) => {
  return client("presence", {
    method: "POST",
    body: data,
  });
};
