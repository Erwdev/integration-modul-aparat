export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">
        Selamat Datang di Sistem Integrasi Modul Aparat
      </h1>
      <a
        href="/aparat"
        className="text-blue-500 hover:text-blue-700 underline"
      >
        Lihat Daftar Aparat
      </a>
    </div>
  );
}