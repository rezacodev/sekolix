import "./styles.css";
import {
  Header,
  Hero,
  AboutSection,
  NewsList,
  Gallery,
  FacultyCards,
  TestimonialSection,
  AcademicCalendar,
  Stats,
  Footer,
} from "@/components/themes/academic-classic";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import prisma from "@/lib/db";

// Force dynamic rendering to always fetch fresh theme data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const sampleFaculty = [
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
  {
    id: "4",
    name: "Mr. David Williams",
    position: "Mathematics Teacher",
    department: "Mathematics",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop",
    email: "d.williams@school.edu",
    phone: "+62 123 456 7894",
    bio: "Making mathematics accessible and fun through innovative teaching methods and real-world applications.",
  },
];

const sampleTestimonials = [
  {
    id: "1",
    name: "Jessica Martinez",
    role: "Alumni",
    year: "2022",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    quote: "Excellence Academy prepared me not just academically, but also helped me develop critical thinking and leadership skills that I use every day in my career.",
  },
  {
    id: "2",
    name: "Robert Anderson",
    role: "Parent",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    quote: "As a parent, I am incredibly impressed with the dedication of the faculty and the holistic approach to education. My children thrive here.",
  },
  {
    id: "3",
    name: "Sophia Lee",
    role: "Current Student",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    quote: "The supportive environment and excellent facilities make learning enjoyable. I feel empowered to pursue my dreams and explore my interests.",
  },
];

const sampleEvents = [
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
  {
    id: "4",
    title: "Christmas Concert",
    date: "2025-12-22",
    time: "7:00 PM",
    location: "Auditorium",
    category: "cultural" as const,
    description: "Annual holiday music performance by school choir and orchestra.",
  },
  {
    id: "5",
    title: "Science Olympiad",
    date: "2026-01-10",
    time: "9:00 AM",
    location: "Science Building",
    category: "academic" as const,
    description: "Regional science competition for high school students.",
  },
  {
    id: "6",
    title: "Art Exhibition Opening",
    date: "2026-01-15",
    time: "6:00 PM",
    location: "Art Gallery",
    category: "cultural" as const,
    description: "Showcase of student artwork from fall semester.",
  },
];

export default async function AcademicClassicPage() {
  // Fetch theme configuration
  const themeConfig = await getThemeConfigById('academic-classic') || getDefaultThemeConfig('academic-classic');
  
  // Fetch all global landing sections
  const landingSections = await prisma.landingSection.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  
  const heroSection = landingSections.find(s => s.slug === 'hero');

  // Fetch faculty from database
  const faculty = await prisma.faculty.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  const safeFaculty = (faculty.length > 0 ? faculty : sampleFaculty).map((member) => ({
    ...member,
    department: member.department ?? "",
    image: member.image ?? "",
    email: member.email ?? undefined,
    phone: member.phone ?? undefined,
    bio: member.bio ?? undefined,
  }));

  const recentNews = await prisma.news.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    take: 6,
  });

  const newsList = recentNews.map((item) => ({
    id: item.id,
    title: item.title,
    excerpt: item.excerpt ?? "",
    image:
      item.image ??
      "https://images.unsplash.com/photo-1503424886307-2f6fdf9c2a3c?w=1200&h=900&fit=crop",
    category: item.category ?? "Informasi",
    publishedAt: (item.publishedAt ?? item.createdAt).toISOString(),
    slug: item.slug,
  }));

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
      <div className="w-full">
        <Header />
        <main className="min-h-screen bg-gray-50 overflow-x-hidden w-full pt-20">
        <Hero 
          title={heroSection?.title}
          subtitle={heroSection?.subtitle ?? undefined}
          body={heroSection?.body ?? undefined}
          image={heroSection?.image ?? undefined}
        />
        <AboutSection />
        <Stats />
        <NewsList news={newsList} viewAllLink="/informasi/news" />
        <Gallery viewAllLink="/gallery" />
        <FacultyCards faculty={safeFaculty} />
        <TestimonialSection testimonials={sampleTestimonials} />
        <AcademicCalendar events={sampleEvents} viewAllLink="/informasi/events" />
        <Footer />
        </main>
      </div>
    </ThemeProvider>
  );
}
