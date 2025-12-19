import { Header, Footer, FacultyCards } from '@/components/themes/academic-classic';
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import prisma from "@/lib/db";

// Force dynamic rendering to always fetch fresh theme data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FacultyPage() {
  // Fetch theme configuration
  const themeConfig = await getThemeConfigById('academic-classic') || getDefaultThemeConfig('academic-classic');

  // Fetch faculty from database
  const faculty = await prisma.faculty.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  const safeFaculty = (faculty.length > 0 ? faculty : [
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
  ]).map((member) => ({
    ...member,
    department: member.department ?? "",
    image: member.image ?? "",
    email: member.email ?? undefined,
    phone: member.phone ?? undefined,
    bio: member.bio ?? undefined,
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
          {/* Page Header - Full Width */}
          <div className="text-center bg-blue-50 pt-24 pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="inline-block mb-4">
                <div className="flex items-center gap-2 px-4 py-1 academic-accent-bg-light rounded-full academic-accent-border" style={{borderWidth: '1px'}}>
                  <div className="w-2 h-2 academic-accent-bg rounded-full" />
                  <span className="text-[#001f3f] font-serif text-sm uppercase tracking-wider">
                    Faculty & Staff
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#001f3f] mb-4">
                Our Distinguished Faculty
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Meet our dedicated team of educators committed to excellence in education and student development
              </p>
              <div className="w-24 h-1 academic-accent-bg mx-auto mt-6" />
            </div>
          </div>
        
        {/* Content */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FacultyCards faculty={safeFaculty} />
          </div>
        </section>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}