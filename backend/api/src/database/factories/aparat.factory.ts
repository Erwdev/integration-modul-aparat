
import { faker } from '@faker-js/faker/locale/id_ID'; // ✅ Pakai locale Indonesia
import { Jabatan } from '../../aparat/enums/jabatan.enum';
import { StatusAparat } from '../../aparat/enums/status-aparat.enum';

export class AparatFactory {
  /**
   * Generate NIK Indonesia yang valid (16 digit)
   */
  static generateNIK(): string {
    const provinsi = '33'; // Jawa Tengah (atau sesuaikan)
    const kabupaten = '01'; // Yogyakarta
    const kecamatan = faker.string.numeric(2);
    const tanggal = faker.date.past({ years: 50 }).getDate().toString().padStart(2, '0');
    const bulan = (faker.date.past().getMonth() + 1).toString().padStart(2, '0');
    const tahun = faker.date.past({ years: 50 }).getFullYear().toString().slice(-2);
    const urut = faker.string.numeric(4);
    
    return `${provinsi}${kabupaten}${kecamatan}${tanggal}${bulan}${tahun}${urut}`;
  }

  /**
   * Generate NIP Indonesia yang valid (18 digit)
   */
  static generateNIP(): string {
    const tahun = faker.date.past({ years: 30 }).getFullYear();
    const bulan = (faker.date.past().getMonth() + 1).toString().padStart(2, '0');
    const tanggal = faker.date.past().getDate().toString().padStart(2, '0');
    const tahunPengangkatan = faker.date.past({ years: 10 }).getFullYear();
    const jenisKelamin = faker.helpers.arrayElement(['1', '2']); // 1=L, 2=P
    const urut = faker.string.numeric(3);
    
    return `${tahun}${bulan}${tanggal}${tahunPengangkatan}${jenisKelamin}${urut}`;
  }

  /**
   * Generate data aparat lengkap
   */
  static generate(overrides: Partial<any> = {}): any {
    const jenisKelamin = faker.helpers.arrayElement(['L', 'P']);
    const firstName = faker.person.firstName(jenisKelamin === 'L' ? 'male' : 'female');
    const lastName = faker.person.lastName();
    
    return {
      nama: `${firstName} ${lastName}`,
      nik: this.generateNIK(),
      nip: faker.helpers.maybe(() => this.generateNIP(), { probability: 0.8 }), // 80% punya NIP
      jenis_kelamin: jenisKelamin,
      tempat_lahir: faker.location.city(),
      tanggal_lahir: faker.date.birthdate({ min: 25, max: 60, mode: 'age' }),
      agama: faker.helpers.arrayElement(['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']),
      pangkat_golongan: faker.helpers.arrayElement([
        'Juru Muda (I/a)',
        'Juru Muda Tingkat I (I/b)',
        'Juru (I/c)',
        'Juru Tingkat I (I/d)',
        'Pengatur Muda (II/a)',
        'Pengatur Muda Tingkat I (II/b)',
        'Pengatur (II/c)',
        'Pengatur Tingkat I (II/d)',
        'Penata Muda (III/a)',
        'Penata Muda Tingkat I (III/b)',
        'Penata (III/c)',
        'Penata Tingkat I (III/d)',
        'Pembina (IV/a)',
        'Pembina Tingkat I (IV/b)',
        'Pembina Utama Muda (IV/c)',
      ]),
      jabatan: faker.helpers.arrayElement(Object.values(Jabatan)),
      pendidikan_terakhir: faker.helpers.arrayElement([
        'SD', 'SMP', 'SMA', 'D3', 'S1', 'S2', 'S3'
      ]),
      nomor_tanggal_keputusan_pengangkatan: faker.helpers.maybe(() => 
        `${faker.string.numeric(3)}/SK/${faker.date.past({ years: 5 }).getFullYear()}`,
        { probability: 0.7 }
      ),
      nomor_tanggal_keputusan_pemberhentian: null,
      keterangan: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
      tanda_tangan_url: null,
      status: faker.helpers.arrayElement([
        StatusAparat.AKTIF,
        StatusAparat.AKTIF, // ✅ Weight AKTIF lebih banyak
        StatusAparat.AKTIF,
        StatusAparat.CUTI,
        StatusAparat.NONAKTIF,
      ]),
      ...overrides, // ✅ Override dengan data custom
    };
  }

  /**
   * Generate multiple data
   */
  static generateMany(count: number, overrides: Partial<any> = {}): any[] {
    return Array.from({ length: count }, () => this.generate(overrides));
  }
}