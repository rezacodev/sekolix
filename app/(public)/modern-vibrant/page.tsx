import "./styles.css";
import {
  Navbar,
  AnimatedHero,
  BentoGrid,
  StatisticsCounter,
  ParallaxCarousel,
  InteractiveCards,
  MasonryGallery,
  VibrantFooter,
  TestimonialsSection,
  AboutSection,
  ProgramsSection,
  NewsSection,
  EventsSection,
  FacultySection
} from "@/components/themes/modern-vibrant";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import prisma from "@/lib/db";

// Force dynamic rendering to always fetch fresh theme data
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ModernVibrantPage() {
  // Fetch theme configuration
  const themeConfig =
    (await getThemeConfigById("modern-vibrant")) || getDefaultThemeConfig("modern-vibrant");

  // Fetch all global landing sections
  const landingSections = await prisma.landingSection.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" }
  });

  const heroSection = landingSections.find(s => s.slug === "hero");

  // Hero data
  const heroData = {
    title: heroSection?.title,
    subtitle: heroSection?.subtitle ?? undefined,
    body: heroSection?.body ?? undefined,
    imageUrl:
      heroSection?.image ??
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=1080&fit=crop",
    videoUrl: undefined,
    ctaText: "Explore Our Programs",
    ctaLink: "/programs"
  };

  // Bento Grid data
  const bentoItems = [
    {
      id: "1",
      title: "Academic Excellence",
      description: "World-class curriculum designed for future leaders",
      imageUrl: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=600&fit=crop",
      link: "/academics",
      size: "large" as const,
      color: themeConfig.primaryColor
    },
    {
      id: "2",
      title: "Sports & Athletics",
      description: "State-of-the-art facilities for champions",
      imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop",
      link: "/sports",
      size: "medium" as const,
      color: themeConfig.secondaryColor
    },
    {
      id: "3",
      title: "Arts & Culture",
      description: "Nurturing creativity and expression",
      imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop",
      link: "/arts",
      size: "small" as const,
      color: themeConfig.accentColor
    },
    {
      id: "4",
      title: "Technology Lab",
      description: "Cutting-edge tech for modern learning",
      imageUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=600&fit=crop",
      link: "/technology",
      size: "small" as const,
      color: themeConfig.primaryColor
    },
    {
      id: "5",
      title: "Global Community",
      description: "Connect with students worldwide",
      imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop",
      link: "/community",
      size: "medium" as const,
      color: themeConfig.accentColor
    }
  ];

  // Statistics data
  const statistics = [
    {
      id: "1",
      value: 2500,
      label: "Active Students",
      icon: "users" as const,
      suffix: "+",
      color: themeConfig.primaryColor
    },
    {
      id: "2",
      value: 150,
      label: "Expert Teachers",
      icon: "books" as const,
      suffix: "+",
      color: themeConfig.secondaryColor
    },
    {
      id: "3",
      value: 50,
      label: "Awards Won",
      icon: "awards" as const,
      suffix: "+",
      color: themeConfig.accentColor
    },
    {
      id: "4",
      value: 30,
      label: "Countries",
      icon: "globe" as const,
      suffix: "+",
      color: themeConfig.accentColor
    }
  ];

  // Carousel data
  const carouselItems = [
    {
      id: "1",
      title: "Annual Science Fair 2024",
      description:
        "Our students showcased groundbreaking projects in robotics, AI, and environmental science. The event attracted visitors from across the region.",
      imageUrl:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop",
      link: "/informasi/news/science-fair-2024"
    },
    {
      id: "2",
      title: "International Cultural Festival",
      description:
        "Students from 25 countries came together to celebrate diversity through music, dance, and traditional cuisines.",
      imageUrl:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&h=1080&fit=crop",
      link: "/informasi/news/cultural-festival"
    },
    {
      id: "3",
      title: "Championship Victory",
      description:
        "Our basketball team clinched the regional championship title after an intense finals match. Proud of our champions!",
      imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1920&h=1080&fit=crop",
      link: "/informasi/news/championship-victory"
    }
  ];

  // Interactive Cards data
  const cardsData = [
    {
      id: "1",
      title: "New STEM Lab Opening",
      description:
        "State-of-the-art facilities with 3D printers, robotics kits, and VR equipment now available for all students.",
      imageUrl: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&h=600&fit=crop",
      category: "Facilities",
      date: "Dec 5, 2024",
      readTime: "3 min read",
      link: "/informasi/news/stem-lab",
      color: themeConfig.primaryColor
    },
    {
      id: "2",
      title: "Student Exchange Program",
      description:
        "Applications now open for our international exchange program with partner schools in 15 countries.",
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
      category: "Programs",
      date: "Dec 3, 2024",
      readTime: "5 min read",
      link: "/informasi/news/exchange-program",
      color: themeConfig.secondaryColor
    },
    {
      id: "3",
      title: "Art Exhibition Success",
      description:
        "Our students&apos; artwork was featured in the city gallery, receiving praise from local art critics.",
      imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop",
      category: "Arts",
      date: "Nov 28, 2024",
      readTime: "4 min read",
      link: "/informasi/news/art-exhibition",
      color: themeConfig.accentColor
    },
    {
      id: "4",
      title: "Coding Bootcamp",
      description:
        "Free weekend coding workshops for beginners. Learn Python, JavaScript, and web development basics.",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop",
      category: "Technology",
      date: "Nov 25, 2024",
      readTime: "3 min read",
      link: "/informasi/news/coding-bootcamp",
      color: themeConfig.primaryColor
    },
    {
      id: "5",
      title: "Environmental Initiative",
      description:
        "Students launch campus-wide sustainability project, planting 500 trees and installing solar panels.",
      imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop",
      category: "Environment",
      date: "Nov 20, 2024",
      readTime: "6 min read",
      link: "/informasi/news/environmental-initiative",
      color: themeConfig.accentColor
    },
    {
      id: "6",
      title: "College Fair 2024",
      description:
        "Representatives from 50+ universities will be on campus to discuss admission opportunities.",
      imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop",
      category: "Career",
      date: "Nov 15, 2024",
      readTime: "4 min read",
      link: "/informasi/news/college-fair",
      color: themeConfig.primaryColor
    }
  ];

  // Gallery data
  const galleryImages = [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
      title: "Graduation Ceremony 2024",
      category: "events",
      height: "tall" as const
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=600&fit=crop",
      title: "Library Study Session",
      category: "campus",
      height: "medium" as const
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop",
      title: "Science Laboratory",
      category: "facilities",
      height: "short" as const
    },
    {
      id: "4",
      url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop",
      title: "Basketball Championship",
      category: "sports",
      height: "medium" as const
    },
    {
      id: "5",
      url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=600&fit=crop",
      title: "Music Performance",
      category: "arts",
      height: "tall" as const
    },
    {
      id: "6",
      url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop",
      title: "Student Collaboration",
      category: "campus",
      height: "short" as const
    },
    {
      id: "7",
      url: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=800&h=600&fit=crop",
      title: "Annual Sports Day",
      category: "sports",
      height: "medium" as const
    },
    {
      id: "8",
      url: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=800&h=600&fit=crop",
      title: "Theater Production",
      category: "arts",
      height: "tall" as const
    },
    {
      id: "9",
      url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop",
      title: "Campus Exterior",
      category: "campus",
      height: "medium" as const
    }
  ];

  // Footer data
  const footerData = {
    schoolName: "Modern High School",
    address: "456 Innovation Street, Tech City, TC 54321",
    phone: "+1 (555) 987-6543",
    email: "info@modernhighschool.edu",
    socialMedia: {
      facebook: "https://facebook.com/modernhighschool",
      instagram: "https://instagram.com/modernhighschool",
      twitter: "https://twitter.com/modernhighsch",
      youtube: "https://youtube.com/@modernhighschool"
    }
  };

  // Testimonials data
  const testimonialsData = [
    {
      id: 1,
      name: "Budi Santoso",
      role: "Alumni",
      year: "2022",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      quote:
        "Sekolah ini memberikan fondasi yang sangat kuat untuk karir saya di dunia IT. Guru-gurunya luar biasa dan fasilitasnya sangat modern!",
      rating: 5
    },
    {
      id: 2,
      name: "Siti Nurhaliza",
      role: "Siswa Kelas 12",
      year: "2024",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      quote:
        "Belajar di sini sangat menyenangkan! Banyak kegiatan ekstrakurikuler dan program magang yang mempersiapkan kami untuk dunia kerja.",
      rating: 5
    },
    {
      id: 3,
      name: "Ahmad Rizki",
      role: "Alumni",
      year: "2021",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
      quote:
        "Setelah lulus, saya langsung diterima kerja di perusahaan startup ternama. Skill yang saya dapat di sekolah ini sangat applicable!",
      rating: 5
    }
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
      bio: "With over 20 years of experience in education, Dr. Johnson leads our institution with vision and dedication."
    },
    {
      id: "2",
      name: "Prof. Michael Chen",
      position: "Head of Science Department",
      department: "Science",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
      email: "m.chen@school.edu",
      phone: "+62 123 456 7892",
      bio: "Award-winning educator specializing in physics and mathematics with numerous published research papers."
    },
    {
      id: "3",
      name: "Ms. Emily Rodriguez",
      position: "English Literature Teacher",
      department: "Languages",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop",
      email: "e.rodriguez@school.edu",
      phone: "+62 123 456 7893",
      bio: "Passionate about literature and creative writing, inspiring students to explore the world of words."
    }
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
      description: "School closed for winter holidays. Classes resume January 6th."
    },
    {
      id: "2",
      title: "Parent-Teacher Conference",
      date: "2025-12-15",
      time: "2:00 PM - 6:00 PM",
      location: "Main Hall",
      category: "academic" as const,
      description: "Semester progress discussion with parents and teachers."
    },
    {
      id: "3",
      title: "Basketball Finals",
      date: "2025-12-18",
      time: "4:00 PM",
      location: "Sports Arena",
      category: "sports" as const,
      description: "Championship match against rival school."
    }
  ];

  // News data
  const newsData = [
    {
      id: 1,
      title: "Siswa SMK Juara 1 Lomba Programming Nasional",
      excerpt:
        "Tim programming sekolah kami berhasil meraih juara 1 dalam kompetisi nasional yang diikuti lebih dari 100 sekolah dari seluruh Indonesia.",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop",
      category: "Prestasi",
      publishedAt: "15 Januari 2024",
      slug: "juara-lomba-programming"
    },
    {
      id: 2,
      title: "Workshop UI/UX Design bersama Google Indonesia",
      excerpt:
        "Ratusan siswa mengikuti workshop eksklusif tentang desain antarmuka pengguna yang diselenggarakan bersama tim profesional dari Google.",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
      category: "Kegiatan",
      publishedAt: "10 Januari 2024",
      slug: "workshop-ui-ux-google"
    },
    {
      id: 3,
      title: "Pendaftaran Siswa Baru Tahun Ajaran 2024/2025",
      excerpt:
        "Pendaftaran siswa baru telah dibuka! Dapatkan early bird discount hingga 20% untuk pendaftar 100 siswa pertama.",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop",
      category: "Pengumuman",
      publishedAt: "5 Januari 2024",
      slug: "pendaftaran-siswa-baru"
    }
  ];

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
      <main className="min-h-screen bg-gray-50 overflow-x-hidden w-full">
        <Navbar />
        <AnimatedHero {...heroData} />
        <StatisticsCounter statistics={statistics} />
        <AboutSection />
        <ProgramsSection />
        <FacultySection faculty={facultyData} />
        <EventsSection events={eventsData} />
        <BentoGrid items={bentoItems} />
        <TestimonialsSection testimonials={testimonialsData} />
        <NewsSection news={newsData} />
        <ParallaxCarousel items={carouselItems} />
        <InteractiveCards
          cards={cardsData}
          title="Latest News & Events"
          subtitle="Stay connected with our vibrant community"
        />
        <MasonryGallery images={galleryImages} />
        <VibrantFooter {...footerData} />
      </main>
    </ThemeProvider>
  );
}
