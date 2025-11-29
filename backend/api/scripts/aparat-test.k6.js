import http from "k6/http";
import { check, sleep, group } from "k6";
import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import encoding from "k6/encoding";

export let options = {
  stages: [
    { duration: "30s", target: 100 },
    { duration: "20s", target: 250 },
    { duration: "20s", target: 500 },
    { duration: "20s", target: 250 },
    { duration: "20s", target: 100 },
    { duration: "15s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.4"],
  },
};

// =========================
// ✅ FIXED: Generate Unique ID
// =========================
function generateUniqueID(prefix, length = 16) {
  // Kombinasi timestamp + VU + iteration + random
  // Ini SANGAT kecil kemungkinan collision
  const timestamp = Date.now().toString().slice(-8); // 8 digit terakhir
  const vu = __VU.toString().padStart(3, "0");       // 3 digit VU
  const iter = __ITER.toString().padStart(3, "0");   // 3 digit iteration
  const rand = Math.floor(Math.random() * 100).toString().padStart(2, "0"); // 2 digit random
  
  // Format: [prefix][timestamp][VU][iter][rand]
  const uniqueStr = `${prefix}${timestamp}${vu}${iter}${rand}`;
  
  // Potong atau pad ke length yang diinginkan
  return uniqueStr.substring(0, length).padEnd(length, "0");
}

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
    timeout: '30s'
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

  const isSuccess = res.status >= 200 && res.status < 300;
  check(res, { [`${name} status 2xx`]: (r) => isSuccess });

  if (!isSuccess) {
    console.log(`❌ ${name} failed: ${res.status} - ${res.body}`);
  }

  return res;
}

// ✅ FIXED: Retry dengan REGENERATE data baru
function requestWithRetry(name, method, url, bodyGenerator = null, extraHeaders = {}, maxRetries = 1) {
  let res;
  for (let i = 0; i <= maxRetries; i++) {
    // Generate body baru setiap retry (jika bodyGenerator adalah function)
    const body = typeof bodyGenerator === 'function' ? bodyGenerator() : bodyGenerator;
    
    res = requestWithTag(name, method, url, body, extraHeaders);
    
    if (res && res.status >= 200 && res.status < 300) {
      return res;
    }
    
    // Jika error duplicate (409), log warning
    if (res && res.status === 409 && i < maxRetries) {
      console.log(`⚠️ ${name} duplicate detected, regenerating data... (retry ${i + 1}/${maxRetries})`);
      sleep(0.5);
    } else if (i < maxRetries) {
      sleep(0.5);
    }
  }
  return res;
}

// =========================
// ✅ CLEANUP HELPER
// =========================
function cleanupAparat(baseUrl, aparatId) {
  if (!aparatId) return;
  
  try {
    const deleteRes = requestWithTag(
      "CLEANUP_DELETE_APARAT",
      "DELETE",
      `${baseUrl}/api/v1/aparat/${aparatId}`
    );
    
    if (deleteRes && deleteRes.status >= 200 && deleteRes.status < 300) {
      console.log(`🧹 Cleanup success: ${aparatId}`);
    } else {
      console.log(`⚠️ Cleanup failed for: ${aparatId}`);
    }
  } catch (e) {
    console.error(`Error during cleanup: ${e}`);
  }
}

// =========================
// MAIN TEST
// =========================
export default function (data) {
  const token = data.token;
  const baseUrl = data.baseUrl;

  if (!token) {
    console.log("No token available, skipping iteration");
    return;
  }

  __ENV.TOKEN = token;
  __ENV.BASE_URL = baseUrl;

  const randomNum = Math.floor(Math.random() * 99999);
  let aparatId = null;
  let createdIds = []; // Track semua ID yang dibuat untuk cleanup

  // =========================
  // GROUP 1: READ OPERATIONS
  // =========================
  group("READ_OPERATIONS", () => {
    requestWithRetry("GET_ALL_APARAT", "GET", `${baseUrl}/api/v1/aparat?page=1&limit=5`);
    sleep(0.3);

    requestWithRetry("GET_PROFILE", "GET", `${baseUrl}/auth/profile`);
    sleep(0.3);
  });

  // =========================
  // GROUP 2: CREATE APARAT DENGAN UNIQUE ID
  // =========================
  group("CREATE_APARAT", () => {
    // ✅ FIXED: Function generator untuk payload baru setiap call
    const generateAparatPayload = () => {
      const nip = generateUniqueID("2991", 16);
      const nik = generateUniqueID("2321", 16);
      
      return JSON.stringify({
        "nama": `Madess Arjuna Wijaya ${Date.now()}-${__VU}-${__ITER}`,
        "nip": nip,
        "nik": nik,
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

      });
    };

    // ✅ FIXED: Retry akan generate payload BARU setiap kali
    const createRes = requestWithRetry(
      "CREATE_APARAT",
      "POST",
      `${baseUrl}/api/v1/aparat`,
      generateAparatPayload, // Pass function, bukan string
      {},
      2 // 2 retries dengan data berbeda
    );

    if (createRes && (createRes.status === 201 || createRes.status === 200)) {
      try {
        const body = JSON.parse(createRes.body);
        aparatId = body.id || body.uuid || (body.data && body.data.id);
        createdIds.push(aparatId); // Track untuk cleanup
        console.log(`✅ CREATE success, ID: ${aparatId}`);
      } catch (e) {
        console.error("Parse error:", e);
      }
    } else {
      console.log(`❌ CREATE failed after retries: ${createRes ? createRes.status : 'No response'}`);
      if (createRes) {
        console.log(`Error details: ${createRes.body}`);
      }
    }
    sleep(0.5);
  });

  // =========================
  // GROUP 3: OPERATIONS
  // =========================
  if (aparatId) {
    group("OPERATIONS_WITH_DATA", () => {
      requestWithRetry("GET_APARAT_BY_ID", "GET", `${baseUrl}/api/v1/aparat/${aparatId}`);
      sleep(0.3);

      const updatePayload = JSON.stringify({
        "nama": `Madess Arjuna Updated ${Date.now()}`,
        "jabatan": "Sekretaris Dusun",
        "keterangan": "Updated - Berprestasi dalam administrasi desa",
        "pangkat_golongan": "Penata Tk.I (III/d)"
      });
      requestWithRetry("UPDATE_APARAT", "PUT", `${baseUrl}/api/v1/aparat/${aparatId}`, updatePayload);
      sleep(0.3);

      requestWithRetry("UPDATE_STATUS", "PATCH", `${baseUrl}/api/v1/aparat/${aparatId}/status`, 
        JSON.stringify({ status: "NONAKTIF" }));
      sleep(0.3);

      // UPLOAD SIGNATURE
      group("UPLOAD_SIGNATURE", () => {
        const boundary = `----WebKitFormBoundary${randomString(16)}`;
        const pngBinary = encoding.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");

        const multipartBody =
          `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="file"; filename="signature_${Date.now()}.png"\r\n` +
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
        }
        sleep(0.3);
      });
    });
  } else {
    console.log("⚠️ Skipping operations karena CREATE gagal");

    group("FALLBACK_OPERATIONS", () => {
      requestWithRetry("GET_ALL_APARAT_2", "GET", `${baseUrl}/api/v1/aparat?page=1&limit=3`);
      sleep(0.3);
    });
  }

  // =========================
  // ✅ CLEANUP: Hapus SEMUA data yang dibuat
  // =========================
  group("CLEANUP", () => {
    for (const id of createdIds) {
      cleanupAparat(baseUrl, id);
      sleep(0.2);
    }
  });

  sleep(0.5);
}

// =========================
// TEARDOWN
// =========================
export function teardown(data) {
  console.log("Load test completed");
  
}