import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  stages: [
    { duration: "30s", target: 20 },   // mulai pemanasan
    { duration: "30s", target: 50 },   // naikkan load
    { duration: "30s", target: 100 },  // puncak beban
    { duration: "30s", target: 0 },    // turunkan - recovery
  ],

  thresholds: {
    http_req_duration: ["p(95)<500"],   // 95% request harus < 500ms
    http_req_failed: ["rate<0.05"],   // error rate harus < 5%
  },
};


const BASE_URL = __ENV.BASE_URL;

// -------------------------------------------
// DUMMY PNG BASE64 (1×1 pixel)
// -------------------------------------------
const signatureBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO9WZfkAAAAASUVORK5CYII=";

// Decode base64 → binary
function base64ToBinary(b64) {
  return http.base64Decode(b64, "binary");
}

// -----------------------------------------------------
// SETUP → Login
// -----------------------------------------------------
export function setup() {
  const payload = {
    username: "admin_erwin_2",
    password: "30062005",
  };

  const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
  });

  check(res, {
    "login success": (r) => r.status === 200 || r.status === 201,
  });

  const token =
    res.json("access_token") ||
    res.json("accessToken") ||
    res.json("token");

  return { token };
}

// -----------------------------------------------------
// MAIN TEST
// -----------------------------------------------------
export default function (data) {
  const token = data.token;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // -----------------------------------------------------
  // CREATE
  // -----------------------------------------------------
  const aparatPayload = {
    nip: "196801011990031001",
    nik: "3201011234567890",
    nama: "John Doe " + Math.floor(Math.random() * 1000),
    jabatan: "Kepala Desa",
    pangkat_golongan: "Pembina (IV/a)",
    nomor_urut: 1,
  };

  const createRes = http.post(
    `${BASE_URL}/api/v1/aparat`,
    JSON.stringify(aparatPayload),
    { headers }
  );

  check(createRes, {
    "create aparat status 201": (r) => r.status === 201,
  });

  const aparatId =
    createRes.json("id_aparat") ||
    createRes.json("id") ||
    createRes.json("uuid");

  console.log("Created ID:", aparatId);

  sleep(1);

  // -----------------------------------------------------
  // UPLOAD SIGNATURE (multipart manual)
  // -----------------------------------------------------
  // -----------------------------------------------------
  // Dummy upload (karena multipart/formdata ga disupport image k6 lama)
  // -----------------------------------------------------
  const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";

  const dummyContent = "THIS_IS_DUMMY_FILE_CONTENT";

  const multipartBody =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="dummy.txt"\r\n` +
    `Content-Type: text/plain\r\n\r\n` +
    dummyContent +
    `\r\n--${boundary}--\r\n`;

  const uploadRes = http.post(
    `${BASE_URL}/api/v1/aparat/upload-signature`,
    multipartBody,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
    }
  );

  check(uploadRes, {
    "upload signature success": (r) => r.status === 201 || r.status === 200,
  });


  sleep(1);

  // -----------------------------------------------------
  // DELETE
  // -----------------------------------------------------
  const deleteRes = http.del(`${BASE_URL}/api/v1/aparat/${aparatId}`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(deleteRes, {
    "delete aparat success": (r) => r.status === 200,
  });

  sleep(1);
}
