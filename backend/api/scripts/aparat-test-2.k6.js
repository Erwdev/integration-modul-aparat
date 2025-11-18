import http from "k6/http";
import { check, sleep, group } from "k6";
import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import encoding from "k6/encoding";

// =======================================
// OPTIONS — STEPS CLEAR, TEST PER ENDPOINT
// =======================================
// export let options = {
//     stages: [
//         { duration: "10s", target: 50 },    // warm up
//         { duration: "20s", target: 150 },   // naik
//         { duration: "20s", target: 300 },   // stabil sedang
//         { duration: "20s", target: 500 },   // peak load
//         { duration: "20s", target: 300 },   // turun terkontrol
//         { duration: "10s", target: 100 },   // cool down
//         { duration: "10s", target: 0 },     // shutdown
//     ],
//     thresholds: {
//         http_req_duration: ["p(95)<1500"],
//         http_req_failed: ["rate<0.01"],
//     },
// };

export let options = {
  stages: [
    { duration: "10s", target: 50 },      // warm up
    { duration: "20s", target: 150 },     // naik
    { duration: "20s", target: 300 },     // steady medium

    // --- SOAK 1 (medium load) ---
    { duration: "60s", target: 300 },     // tahan 300 VUs → cek memory/latency drift

    { duration: "20s", target: 500 },     // naik lagi

    // --- SOAK 2 (high load) ---
    { duration: "60s", target: 500 },     // tahan 500 → lihat apakah sistem mulai goyang

    { duration: "20s", target: 750 },     // naik lagi

    // --- SOAK 3 (breakpoint) ---
    { duration: "60s", target: 750 },     // tahan di 750 → biasanya sistem mulai putus napas

    // --- PUSH UNTIL BREAK ---
    { duration: "20s", target: 1000 },    // tahap kritis
    { duration: "20s", target: 1500 },    // benar-benar push
  
    { duration: "10s", target: 0 },       // shutdown
  ],

  thresholds: {
    http_req_duration: ["p(95)<6000"], // stress test → toleransi longgar
    http_req_failed: ["rate<0.15"],    // boleh naik
  },
};



// =======================================
// UNIQUE ID (ANTI COLLISION) — POINT 1
// =======================================
function generateUniqueID(prefix, length = 16) {
    const part1 = Date.now().toString().slice(-7);
    const part2 = __VU.toString().padStart(3, "0");
    const part3 = __ITER.toString().padStart(3, "0");
    const part4 = Math.random().toString().slice(2, 6);
    return `${prefix}${part1}${part2}${part3}${part4}`.slice(0, length);
}

// =======================================
// SETUP → LOGIN sekali
// =======================================
export function setup() {
    const baseUrl = __ENV.BASE_URL || "http://localhost:3000";

    const res = http.post(`${baseUrl}/auth/login`, JSON.stringify({
        username: __ENV.USERNAME || "admin_erwin_2",
        password: __ENV.PASSWORD || "30062005",
    }), {
        headers: { "Content-Type": "application/json" },
    });

    check(res, { "login success": (r) => r.status === 200 });

    const token = JSON.parse(res.body).access_token;
    return { token, baseUrl };
}

// =======================================
// WRAPPER — SEMUA REQUEST PUNYA TAG
// =======================================
function taggedRequest(name, method, url, body = null, extraHeaders = {}) {
    const headers = Object.assign({
        Authorization: `Bearer ${__ENV.TOKEN}`,
        "Content-Type": "application/json",
    }, extraHeaders);

    const params = { headers, tags: { name }, timeout: "30s" };
    const m = method.toUpperCase();

    let res =
        m === "GET" ? http.get(url, params) :
            m === "POST" ? http.post(url, body, params) :
                m === "PUT" ? http.put(url, body, params) :
                    m === "PATCH" ? http.patch(url, body, params) :
                        m === "DELETE" ? http.del(url, null, params) :
                            null;

    check(res, { [`${name} 2xx`]: (r) => r.status >= 200 && r.status < 300 });
    return res;
}

// =======================================
// RETRY (ANTI DUPLICATE) — POINT 2
// =======================================
function retryRequest(name, method, url, bodyGen = null, extraHeaders = {}, retry = 2) {
    for (let i = 0; i <= retry; i++) {
        const body = typeof bodyGen === "function" ? bodyGen() : bodyGen;
        const res = taggedRequest(name, method, url, body, extraHeaders);

        if (res.status >= 200 && res.status < 300) return res;

        if (res.status === 409 && i < retry) {
            console.log(`⚠️ ${name} duplicate → regenerating… retry ${i + 1}`);
            sleep(0.3);
        }
    }
}

// =======================================
// CLEANUP — POINT 3
// =======================================
function cleanup(baseUrl, id) {
    if (!id) return;
    const res = taggedRequest("DELETE_APARAT", "DELETE", `${baseUrl}/api/v1/aparat/${id}`);
    if (res.status >= 200 && res.status < 300) {
        console.log(`🧹 CLEANUP OK → ${id}`);
    } else {
        console.log(`⚠️ Cleanup failed: ${id}`);
    }
}

// =======================================
// MAIN TEST — GRUP JELAS PER ENDPOINT
// =======================================
export default function (data) {
    __ENV.TOKEN = data.token;
    __ENV.BASE_URL = data.baseUrl;

    const baseUrl = data.baseUrl;
    let created = null;

    // --------------------------
    // GROUP 1 — READ-ONLY TESTS
    // --------------------------
    group("READ_OPERATIONS", () => {
        taggedRequest("LIST_APARAT", "GET", `${baseUrl}/api/v1/aparat?page=1&limit=5`);
        sleep(0.2);

        taggedRequest("GET_PROFILE", "GET", `${baseUrl}/auth/profile`);
        sleep(0.2);
    });

    // --------------------------
    // GROUP 2 — CREATE
    // --------------------------
    group("CREATE_APARAT", () => {
        // Payload generator sesuai template yang berhasil
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

        // Request dengan retry
        const res = retryRequest("CREATE_APARAT", "POST", `${baseUrl}/api/v1/aparat`, generateAparatPayload);

        // Safe check response
        let created = null;
        if (res && res.body) {
            try {
                const parsed = JSON.parse(res.body);
                created = parsed.id || (parsed.data && parsed.data.id);
            } catch (e) {
                console.error("Failed parsing CREATE_APARAT response:", e);
            }
        } else {
            console.log("CREATE_APARAT failed or empty response");
        }

        sleep(0.3);
    });

    // --------------------------
    // GROUP 3 — OPERATIONS on CREATED
    // --------------------------
    if (created) {
        group("OPERATIONS_WITH_DATA", () => {
            taggedRequest("GET_BY_ID", "GET", `${baseUrl}/api/v1/aparat/${created}`);
            sleep(0.2);

            taggedRequest(
                "UPDATE_APARAT",
                "PUT",
                `${baseUrl}/api/v1/aparat/${created}`,
                JSON.stringify({ jabatan: "Kaur Umum", nama: `Updated_${Date.now()}` }),
            );
            sleep(0.2);

            taggedRequest(
                "UPDATE_STATUS",
                "PATCH",
                `${baseUrl}/api/v1/aparat/${created}/status`,
                JSON.stringify({ status: "NONAKTIF" }),
            );
            sleep(0.2);
        });
    }

    // --------------------------
    // GROUP 4 — UPLOAD SIGNATURE
    // --------------------------
    group("UPLOAD_SIGNATURE", () => {
        const boundary = `----Boundary${randomString(12)}`;
        const png = encoding.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");

        const body =
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="file"; filename="sig.png"\r\n` +
            `Content-Type: image/png\r\n\r\n` +
            `${png}\r\n` +
            `--${boundary}--\r\n`;

        taggedRequest(
            "UPLOAD_SIGNATURE",
            "POST",
            `${baseUrl}/api/v1/aparat/upload-signature`,
            body,
            { "Content-Type": `multipart/form-data; boundary=${boundary}` }
        );
        sleep(0.2);
    });

    // --------------------------
    // GROUP 5 — CLEANUP created data
    // --------------------------
    group("CLEANUP", () => {
        cleanup(baseUrl, created);
        sleep(0.1);
    });
}

// =======================
export function teardown() {
    console.log("Load test finished.");
}
