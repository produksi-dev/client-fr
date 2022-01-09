import axios from "axios";
import { camelizeKeys, decamelizeKeys } from "humps";
import parser from "fast-xml-parser";
import moment from "moment";
import client from "./ApiClient";

const onError = (err) => {
  let error = err?.response?.data;
  error = camelizeKeys(error);

  return {
    isSuccess: false,
    data: err?.data,
    error,
    status: err?.response?.status,
  };
};

export const getBelumSinkron = (cam) => {
  return axios({
    method: "POST",
    url: "/api/cors",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      url: `${cam?.ipCamera}/FaceRecognition/QueryRecordCount`,
      method: "PUT",
      headers: {
        Authorization: `Basic ${cam?.password}`,
      },
      data: `<?xml version='1.0' encoding='UTF-8' ?>
    <FaceRecognitionFilter>
        <GroupID>-1</GroupID>
        <PeopleName></PeopleName>
        <StartTime>${moment(cam?.lastSync).format(
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

export const getLogData = (cam, size, page) => {
  return axios({
    method: "POST",
    url: "/api/cors",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      url: `${cam?.ipCamera}/FaceRecognition/QueryRecordList`,
      method: "PUT",
      headers: {
        Authorization: `Basic ${cam?.password}`,
      },
      data: `<?xml version='1.0' encoding='UTF-8' ?>
    <FaceRecognitionFilter>
        <GroupID>-1</GroupID>
        <PeopleName></PeopleName>
        <StartTime>${moment(cam?.lastSync).format(
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

export const getLogPhoto = (cam, faceData) => {
  return axios({
    method: "POST",
    url: "/api/cors",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      url: `${cam?.ipCamera}/FaceRecognition/SnapshotByRecognitionRecord`,
      method: "POST",
      headers: {
        Authorization: `Basic ${cam?.password}`,
      },
      responseType: "arraybuffer",
      data: `<?xml version='1.0' encoding='UTF-8' ?><RecognitionInfo><SnapshotPath>${faceData?.SnapshotPath}</SnapshotPath></RecognitionInfo>`,
    },
  }).then(async (res) => {
    return {
      isSuccess: true,
      error: false,
      data: res.data,
      status: res?.status,
    };
  });
};
