import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedLandingPage() {
  console.log("🌐 Seeding landing page content...");

  // Create sample pages
  const pages = [
    {
      title: "Tentang Sekolah",
      slug: "tentang-sekolah",
      content: `
        <h1>Tentang Sekolah Kami</h1>
        <p>Sekolah kami berkomitmen untuk memberikan pendidikan berkualitas tinggi kepada setiap siswa.</p>
        <h2>Visi</h2>
        <p>Menjadi sekolah unggul dalam bidang akademik dan karakter.</p>
        <h2>Misi</h2>
        <ul>
          <li>Menyediakan pendidikan berkualitas</li>
          <li>Mengembangkan potensi siswa secara holistik</li>
          <li>Membangun karakter yang kuat</li>
        </ul>
      `,
      description: "Informasi tentang visi, misi, dan profil sekolah kami",
      isPublished: true
    },
    {
      title: "Program Akademik",
      slug: "program-akademik",
      content: `
        <h1>Program Akademik</h1>
        <p>Kami menawarkan berbagai program akademik untuk mendukung perkembangan siswa.</p>
        <h2>Kurikulum</h2>
        <p>Sekolah kami menggunakan kurikulum terbaru yang disesuaikan dengan kebutuhan zaman.</p>
      `,
      description: "Informasi lengkap tentang program akademik yang tersedia",
      isPublished: true
    },
    {
      title: "Fasilitas",
      slug: "fasilitas",
      content: `
        <h1>Fasilitas Sekolah</h1>
        <p>Sekolah kami dilengkapi dengan fasilitas modern untuk mendukung proses belajar mengajar.</p>
        <ul>
          <li>Ruang kelas ber-AC</li>
          <li>Laboratorium komputer</li>
          <li>Laboratorium sains</li>
          <li>Perpustakaan</li>
          <li>Lapangan olahraga</li>
        </ul>
      `,
      description: "Fasilitas dan infrastruktur yang tersedia di sekolah",
      isPublished: true
    }
  ];

  const createdPages = [];
  for (const pageData of pages) {
    let page = await prisma.page.findFirst({
      where: { slug: pageData.slug }
    });

    if (!page) {
      page = await prisma.page.create({
        data: pageData
      });
      console.log(`✓ Created page: ${page.title}`);
    } else {
      console.log(`ℹ️  Page already exists: ${page.title}`);
    }

    createdPages.push(page);
  }

  // Create sample articles
  const articles = [
    {
      title: "Penerimaan Siswa Baru Tahun 2026",
      slug: "penerimaan-siswa-baru-2026",
      content: `
        <h1>Penerimaan Siswa Baru Tahun 2026</h1>
        <p>Pendaftaran siswa baru untuk tahun ajaran 2026/2027 telah dibuka.</p>
        <h2>Persyaratan</h2>
        <ul>
          <li>Foto copy ijazah</li>
          <li>Foto copy KK</li>
          <li>Pas foto 3x4</li>
          <li>Surat keterangan sehat</li>
        </ul>
        <h2>Jadwal Penting</h2>
        <ul>
          <li>Pendaftaran: 1 Januari - 28 Februari 2026</li>
          <li>Test: 1 - 15 Maret 2026</li>
          <li>Pengumuman: 20 Maret 2026</li>
        </ul>
      `,
      excerpt: "Informasi lengkap tentang penerimaan siswa baru tahun ajaran 2026/2027",
      isPublished: true
    },
    {
      title: "Kegiatan Ekstrakurikuler",
      slug: "kegiatan-ekstrakurikuler",
      content: `
        <h1>Kegiatan Ekstrakurikuler</h1>
        <p>Sekolah kami menyediakan berbagai kegiatan ekstrakurikuler untuk mengembangkan bakat siswa.</p>
        <h2>Kegiatan Tersedia</h2>
        <ul>
          <li>Pramuka</li>
          <li>PMR</li>
          <li>Futsal</li>
          <li>Basket</li>
          <li>Paduan Suara</li>
          <li>Tari</li>
          <li>Drama</li>
        </ul>
      `,
      excerpt: "Berbagai kegiatan ekstrakurikuler yang dapat diikuti siswa",
      isPublished: true
    }
  ];

  const createdArticles = [];
  for (const articleData of articles) {
    let article = await prisma.article.findFirst({
      where: { slug: articleData.slug }
    });

    if (!article) {
      article = await prisma.article.create({
        data: articleData
      });
      console.log(`✓ Created article: ${article.title}`);
    } else {
      console.log(`ℹ️  Article already exists: ${article.title}`);
    }

    createdArticles.push(article);
  }

  console.log(`✓ Seeded ${createdPages.length} pages and ${createdArticles.length} articles`);
  return { pages: createdPages, articles: createdArticles };
}