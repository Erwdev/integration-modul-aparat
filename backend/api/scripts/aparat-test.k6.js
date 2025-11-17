import http from "k6/http";
import { check, sleep, group } from "k6";
import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import encoding from "k6/encoding";

// =========================
// OPTIONS
// =========================


export let options = {
  stages: [
    { duration: "30s", target: 100 },    // Start 100 VUs
    { duration: "20s", target: 250 },    // Naik ke 250 VUs  
    { duration: "20s", target: 500 },    // Puncak 500 VUs
    { duration: "20s", target: 250 },    // Turun ke 250
    { duration: "20s", target: 100 },    // Turun ke 100
    { duration: "15s", target: 0 },      // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],  // Lebih longgar untuk high load
    http_req_failed: ["rate<0.4"],      // Izinkan 40% failure karena rate limiting
  },
  // discardResponseBodies: false,  // DEFAULT - response body disimpan
};

// =========================
// SETUP → LOGIN
// =========================
export function setup() {
  const baseUrl = __ENV.BASE_URL || "http://localhost:3000";
  const payload = { 
    username: __ENV.USERNAME || "admin_erwin_2", 
    password: __ENV.PASSWORD || "30062005" 
  };
  
  const res = http.post(`${baseUrl}/auth/login`, JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
  });

  check(res, { 
    "login success": (r) => r.status === 200 || r.status === 201 
  });

  let token = null;
  try {
    const body = JSON.parse(res.body);
    token = body.access_token || body.accessToken || body.token || (body.data && body.data.access_token);
  } catch (e) {
    console.error("Failed to parse login response:", e);
  }

  if (!token) {
    console.error("LOGIN FAILED — NO TOKEN RECEIVED");
    console.log("Response status:", res.status);
    console.log("Response body:", res.body);
  }

  return { token, baseUrl };
}

// =========================
// HELPER FUNCTION
// =========================
function requestWithTag(name, method, url, body = null, extraHeaders = {}) {
  const headers = Object.assign(
    { 
      Authorization: `Bearer ${__ENV.TOKEN}`, 
      "Content-Type": "application/json" 
    },
    extraHeaders
  );
  
  let res;
  const params = { 
    headers, 
    tags: { name },
    timeout: '30s'  // Tambah timeout
  };

  switch (method.toUpperCase()) {
    case "GET":
      res = http.get(url, params);
      break;
    case "POST":
      res = http.post(url, body, params);
      break;
    case "PUT":
      res = http.put(url, body, params);
      break;
    case "PATCH":
      res = http.patch(url, body, params);
      break;
    case "DELETE":
      res = http.del(url, null, params);
      break;
    default:
      console.error(`Unknown method: ${method}`);
      return null;
  }
  
  // Check dengan logic yang lebih baik
  const isSuccess = res.status >= 200 && res.status < 300;
  check(res, { [`${name} status 2xx`]: (r) => isSuccess });
  
  if (!isSuccess) {
    console.log(`❌ ${name} failed: ${res.status} - ${res.body}`);
  }
  
  return res;
}

// Helper dengan retry mechanism
function requestWithRetry(name, method, url, body = null, extraHeaders = {}, maxRetries = 1) {
  let res;
  for (let i = 0; i <= maxRetries; i++) {
    res = requestWithTag(name, method, url, body, extraHeaders);
    if (res && res.status >= 200 && res.status < 300) {
      return res;
    }
    if (i < maxRetries) {
      sleep(0.5); // Tunggu 0.5 detik sebelum retry
    }
  }
  return res;
}

// =========================
// MAIN TEST DENGAN DATA YANG DIPERBAIKI
// =========================
export default function (data) {
  const token = data.token;
  const baseUrl = data.baseUrl;
  
  if (!token) {
    console.log("No token available, skipping iteration");
    return;
  }

  // Simpan token di ENV
  __ENV.TOKEN = token;
  __ENV.BASE_URL = baseUrl;

  const randomNum = Math.floor(Math.random() * 99999);
  let aparatId = null;

  // =========================
  // GROUP 1: READ OPERATIONS (Lebih Aman)
  // =========================
  group("READ_OPERATIONS", () => {
    // Test GET endpoints terlebih dahulu
    requestWithRetry("GET_ALL_APARAT", "GET", `${baseUrl}/api/v1/aparat?page=1&limit=5`);
    sleep(0.3);
    
    // Get profile user
    requestWithRetry("GET_PROFILE", "GET", `${baseUrl}/auth/profile`);
    sleep(0.3);
  });

  // =========================
  // GROUP 2: CREATE APARAT DENGAN DATA YANG BENAR
  // =========================
  group("CREATE_APARAT", () => {
    // PERBAIKI: HAPUS nomor_urut dan PASTIKAN NIP & NIK 16 karakter
    const aparatPayload = {
      "nama": `Madess Arjuna Wijaya ${randomNum}`,
      "nip": `29912364${randomNum.toString().padStart(8, "0")}`.substring(0, 16), // Pastikan 16 karakter
      "nik": `23213979${randomNum.toString().padStart(8, "0")}`.substring(0, 16), // Pastikan 16 karakter
      "jenis_kelamin": "L",
      "tempat_lahir": "Ubud,Bali",
      "tanggal_lahir": "1990-12-24",
      "agama": "Hindu",
      "pangkat_golongan": "Penata (III/c)",
      "jabatan": "Kepala Dusun",
      "pendidikan_terakhir": "S1",
      "nomor_tanggal_keputusan_pengangkatan": `647/SK/2024`,
      "nomor_tanggal_keputusan_pemberhentian": null,
      "keterangan": "Berprestasi dalam administrasi desa",
      "tanda_tangan_url": null,
      "status": "AKTIF"
      // HAPUS: nomor_urut (tidak ada di schema)
    };

    console.log(`🔧 Creating aparat with NIP: ${aparatPayload.nip} (${aparatPayload.nip.length} chars)`);
    console.log(`🔧 Creating aparat with NIK: ${aparatPayload.nik} (${aparatPayload.nik.length} chars)`);

    const createRes = requestWithRetry(
      "CREATE_APARAT", 
      "POST", 
      `${baseUrl}/api/v1/aparat`, 
      JSON.stringify(aparatPayload),
      {},
      2 // 2 retries
    );

    if (createRes && (createRes.status === 201 || createRes.status === 200)) {
      try {
        const body = JSON.parse(createRes.body);
        aparatId = body.id || body.uuid || (body.data && body.data.id);
        console.log(`✅ CREATE success, ID: ${aparatId}`);
        console.log(`📝 Nama: ${aparatPayload.nama}`);
        console.log(`🔢 NIP: ${aparatPayload.nip}`);
      } catch(e) {
        console.error("Parse error:", e);
        console.log("Raw response:", createRes.body);
      }
    } else {
      console.log(`❌ CREATE failed: ${createRes ? createRes.status : 'No response'}`);
      if (createRes) {
        console.log(`Error details: ${createRes.body}`);
      }
    }
    sleep(0.5);
  });

  // =========================
  // GROUP 3: OPERATIONS DENGAN DATA YANG SUDAH DIBUAT
  // =========================
  if (aparatId) {
    group("OPERATIONS_WITH_DATA", () => {
      // GET by ID
      requestWithRetry("GET_APARAT_BY_ID", "GET", `${baseUrl}/api/v1/aparat/${aparatId}`);
      sleep(0.3);

      // UPDATE dengan data baru
      const updatePayload = { 
        "nama": `Madess Arjuna Wijaya Updated ${randomNum}`,
        "jabatan": "Sekretaris Dusun",
        "keterangan": "Updated - Berprestasi dalam administrasi desa",
        "pangkat_golongan": "Penata Tk.I (III/d)"
      };
      requestWithRetry("UPDATE_APARAT", "PUT", `${baseUrl}/api/v1/aparat/${aparatId}`, JSON.stringify(updatePayload));
      sleep(0.3);

      // UPDATE STATUS
      requestWithRetry("UPDATE_STATUS", "PATCH", `${baseUrl}/api/v1/aparat/${aparatId}/status`, JSON.stringify({ status: "NONAKTIF" }));
      sleep(0.3);

      // UPLOAD SIGNATURE
      group("UPLOAD_SIGNATURE", () => {
        const boundary = `----WebKitFormBoundary${randomString(16)}`;
        const pngBinary = encoding.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
        
        const multipartBody = 
          `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="file"; filename="signature_${randomNum}.png"\r\n` +
          `Content-Type: image/png\r\n\r\n` +
          pngBinary +
          `\r\n--${boundary}--\r\n`;
        
        const uploadRes = requestWithRetry(
          "UPLOAD_SIGNATURE",
          "POST",
          `${baseUrl}/api/v1/aparat/upload-signature`,
          multipartBody,
          { "Content-Type": `multipart/form-data; boundary=${boundary}` }
        );
        
        if (uploadRes && uploadRes.status === 200) {
          console.log(`✅ Upload signature success`);
          try {
            const uploadBody = JSON.parse(uploadRes.body);
            console.log(`📁 File URL: ${uploadBody.url}`);
          } catch(e) {
            console.log("Upload response:", uploadRes.body);
          }
        }
        sleep(0.3);
      });

      // DELETE
      requestWithRetry("DELETE_APARAT", "DELETE", `${baseUrl}/api/v1/aparat/${aparatId}`);
      sleep(0.3);
    });
  } else {
    console.log("⚠️ Skipping operations karena CREATE gagal");
    
    // Tetap test GET operations meski CREATE gagal
    group("FALLBACK_OPERATIONS", () => {
      requestWithRetry("GET_ALL_APARAT_2", "GET", `${baseUrl}/api/v1/aparat?page=1&limit=3`);
      sleep(0.3);
    });
  }

  sleep(0.5);
}

// =========================
// TEARDOWN
// =========================
export function teardown(data) {
  console.log("Load test completed");
}