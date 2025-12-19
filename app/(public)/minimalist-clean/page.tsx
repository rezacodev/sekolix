import "./styles.css";
import {
  MinimalNavbar,
  MinimalHero,
  MinimalStats,
  MinimalAbout,
  MinimalPrograms,
  MinimalTestimonials,
  MinimalCTA,
  MinimalFooter,
  ListBasedNews,
  BorderlessGallery,
  MinimalFaculty,
  MinimalEvents,
} from "@/components/themes/minimalist-clean";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import prisma from "@/lib/db";

// Force dynamic rendering to always fetch fresh theme data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MinimalistCleanPage() {
  // Fetch theme configuration
  const themeConfig = await getThemeConfigById('minimalist-clean') || getDefaultThemeConfig('minimalist-clean');
  
  // Fetch all global landing sections
  const landingSections = await prisma.landingSection.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  
  const heroSection = landingSections.find(s => s.slug === 'hero');

  // Hero data
  const heroData = {
    title: heroSection?.title?.split(' ')[0] || "Excellence in",
    subtitle: heroSection?.title?.split(' ').slice(1).join(' ') || "Education",
    body: heroSection?.body ?? "SMK Negeri 1 Jakarta memberikan pendidikan kejuruan berkualitas tinggi yang mempersiapkan siswa untuk menghadapi tantangan masa depan.",
    description: heroSection?.subtitle ||
      "SMK Negeri 1 Jakarta memberikan pendidikan kejuruan berkualitas tinggi yang mempersiapkan siswa untuk menghadapi tantangan masa depan.",
    established: "Established 1985",
  };

  // Statistics data
  const statisticsData = [
    {
      id: "1",
      value: 1234,
      label: "Siswa Aktif",
    },
    {
      id: "2",
      value: 87,
      label: "Tenaga Pendidik",
    },
    {
      id: "3",
      value: 5,
      label: "Program Keahlian",
    },
    {
      id: "4",
      value: 95,
      label: "Tingkat Kelulusan",
      suffix: "%",
    },
  ];

  // About data
  const aboutData = {
    title: "Membangun Masa Depan Melalui Pendidikan",
    badge: "Tentang Kami",
    description1:
      "Sejak 1985, SMK Negeri 1 Jakarta telah menjadi institusi pendidikan kejuruan terkemuka yang menghasilkan lulusan berkualitas tinggi.",
    description2:
      "Kami menggabungkan pendekatan akademik yang ketat dengan pelatihan praktis berbasis industri untuk memastikan siswa siap menghadapi dunia kerja.",
    features: [
      { text: "Terakreditasi A oleh BAN-S/M" },
      { text: "Fasilitas modern dan lengkap" },
      { text: "Kerjasama dengan 50+ industri terkemuka" },
      { text: "Kurikulum berbasis kompetensi industri" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
  };

  // Programs data
  const programsData = [
    {
      id: "1",
      number: "01",
      title: "Rekayasa Perangkat Lunak",
      description:
        "Pelajari pengembangan aplikasi web, mobile, dan desktop dengan teknologi terkini. Kuasai berbagai bahasa pemrograman dan framework modern.",
    },
    {
      id: "2",
      number: "02",
      title: "Teknik Komputer & Jaringan",
      description:
        "Spesialisasi dalam infrastruktur jaringan, keamanan siber, dan cloud computing. Persiapan untuk sertifikasi profesional internasional.",
    },
    {
      id: "3",
      number: "03",
      title: "Desain Komunikasi Visual",
      description:
        "Kembangkan kreativitas dalam desain grafis, UI/UX, motion graphics, dan branding. Gunakan tools profesional industri kreatif.",
    },
    {
      id: "4",
      number: "04",
      title: "Akuntansi & Keuangan",
      description:
        "Pahami sistem akuntansi modern, perpajakan, dan manajemen keuangan. Persiapan untuk sertifikasi akuntan profesional.",
    },
    {
      id: "5",
      number: "05",
      title: "Otomatisasi Tata Kelola Perkantoran",
      description:
        "Kuasai administrasi perkantoran modern, manajemen arsip digital, dan komunikasi bisnis profesional.",
    },
  ];

  // Testimonials data
  const testimonialsData = [
    {
      id: 1,
      quote:
        "SMK Negeri 1 Jakarta benar-benar mempersiapkan saya untuk dunia kerja. Keterampilan yang saya pelajari sangat praktis dan relevan dengan industri.",
      name: "Budi Santoso",
      role: "Alumni 2022",
      image: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: 2,
      quote:
        "Guru-guru sangat perhatian terhadap perkembangan anak. Fasilitas lengkap dan modern. Anak saya sangat senang belajar di sini.",
      name: "Ibu Siti Aminah",
      role: "Orang Tua Siswa",
      image: "https://i.pravatar.cc/150?img=5",
    },
    {
      id: 3,
      quote:
        "Selain akademik, karakter dan soft skills juga diasah dengan baik. Sekarang saya sukses menjalankan bisnis berkat ilmu dari sini.",
      name: "Ahmad Rizki",
      role: "Alumni 2020",
      image: "https://i.pravatar.cc/150?img=3",
    },
  ];

  // Faculty data
  const facultyData = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      position: "Principal",
      department: "Administration",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop",
      email: "s.johnson@school.edu",
      phone: "+62 123 456 7891",
      bio: "With over 20 years of experience in education, Dr. Johnson leads our institution with vision and dedication.",
    },
    {
      id: "2",
      name: "Prof. Michael Chen",
      position: "Head of Science Department",
      department: "Science",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
      email: "m.chen@school.edu",
      phone: "+62 123 456 7892",
      bio: "Award-winning educator specializing in physics and mathematics with numerous published research papers.",
    },
    {
      id: "3",
      name: "Ms. Emily Rodriguez",
      position: "English Literature Teacher",
      department: "Languages",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop",
      email: "e.rodriguez@school.edu",
      phone: "+62 123 456 7893",
      bio: "Passionate about literature and creative writing, inspiring students to explore the world of words.",
    },
  ];

  // Events data
  const eventsData = [
    {
      id: "1",
      title: "Winter Break",
      date: "2025-12-20",
      time: "All Day",
      location: "School Campus",
      category: "holiday" as const,
      description: "School closed for winter holidays. Classes resume January 6th.",
    },
    {
      id: "2",
      title: "Parent-Teacher Conference",
      date: "2025-12-15",
      time: "2:00 PM - 6:00 PM",
      location: "Main Hall",
      category: "academic" as const,
      description: "Semester progress discussion with parents and teachers.",
    },
    {
      id: "3",
      title: "Basketball Finals",
      date: "2025-12-18",
      time: "4:00 PM",
      location: "Sports Arena",
      category: "sports" as const,
      description: "Championship match against rival school.",
    },
  ];

  // News data
  const newsData = [
    {
      id: "1",
      title: "Siswa SMK Juara 1 Lomba Programming Nasional",
      excerpt: "Tim programming sekolah kami berhasil meraih juara 1 dalam kompetisi nasional yang diikuti lebih dari 100 sekolah dari seluruh Indonesia.",
      date: "15 Januari 2024",
      category: "Prestasi",
      link: "/informasi/news/juara-lomba-programming",
    },
    {
      id: "2",
      title: "Workshop UI/UX Design bersama Google Indonesia",
      excerpt: "Ratusan siswa mengikuti workshop eksklusif tentang desain antarmuka pengguna yang diselenggarakan bersama tim profesional dari Google.",
      date: "10 Januari 2024",
      category: "Kegiatan",
      link: "/informasi/news/workshop-ui-ux-google",
    },
  ];

  // CTA data
  const ctaData = {
    title: "Siap Memulai Perjalanan Anda?",
    subtitle:
      "Bergabunglah dengan SMK Negeri 1 Jakarta dan wujudkan potensi terbaik Anda.",
  };

  // Footer data
  const footerData = {
    schoolName: "SMK Negeri 1 Jakarta",
    description:
      "Lembaga pendidikan kejuruan terkemuka yang menghasilkan lulusan berkualitas dan siap kerja sejak 1985.",
    address: "Jl. Pendidikan No. 123, Jakarta Selatan 12345",
    phone: "(021) 1234-5678",
    email: "info@smkn1jakarta.sch.id",
    socialMedia: {
      twitter: "https://twitter.com/smkn1jakarta",
      facebook: "https://facebook.com/smkn1jakarta",
      instagram: "https://instagram.com/smkn1jakarta",
      youtube: "https://youtube.com/@smkn1jakarta",
    },
  };

  return (
    <ThemeProvider
      primaryColor={themeConfig.primaryColor}
      secondaryColor={themeConfig.secondaryColor}
      accentColor={themeConfig.accentColor}
      textColor={themeConfig.textColor}
      borderColor={themeConfig.borderColor}
      grayColor={themeConfig.grayColor}
      headingFont={themeConfig.headingFont}
      bodyFont={themeConfig.bodyFont}
    >
      <main className="min-h-screen bg-white overflow-x-hidden w-full">
        <MinimalNavbar />
        <MinimalHero {...heroData} />
        <MinimalStats statistics={statisticsData} />
        <MinimalAbout {...aboutData} />
        <MinimalPrograms
          programs={programsData}
          title="Lima Jalur Menuju Kesuksesan"
          subtitle="Pilih program keahlian yang sesuai dengan minat dan bakat Anda. Setiap program dirancang untuk memberikan kompetensi profesional yang dibutuhkan industri."
        />
        <MinimalFaculty faculty={facultyData} />
        <MinimalEvents events={eventsData} />
        <ListBasedNews news={newsData} title="Latest News" />
        <BorderlessGallery images={[]} title="Gallery" viewAllLink="/gallery" />
        <MinimalTestimonials
          testimonials={testimonialsData}
          title="Apa Kata Mereka"
        />
        <MinimalCTA {...ctaData} />
        <MinimalFooter {...footerData} />
      </main>
    </ThemeProvider>
  );
}
