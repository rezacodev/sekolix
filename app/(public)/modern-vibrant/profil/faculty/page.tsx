import { Navbar, FacultySection, VibrantFooter } from '@/components/themes/modern-vibrant';
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import prisma from "@/lib/db";

// Force dynamic rendering to always fetch fresh theme data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FacultyPage() {
  // Fetch theme configuration
  const themeConfig = await getThemeConfigById('modern-vibrant') || getDefaultThemeConfig('modern-vibrant');

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

  const footerData = {
    schoolName: 'Modern High School',
    address: '456 Innovation Street, Tech City, TC 54321',
    phone: '+1 (555) 987-6543',
    email: 'info@modernhighschool.edu',
    socialMedia: {
      facebook: 'https://facebook.com/modernhighschool',
      instagram: 'https://instagram.com/modernhighschool',
      twitter: 'https://twitter.com/modernhighsch',
      youtube: 'https://youtube.com/@modernhighschool',
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
      <main className="min-h-screen bg-linear-to-b from-slate-50 to-white overflow-x-hidden w-full">
        <Navbar />
        <div className="pt-20">
          {/* Page Header - Full Width */}
          <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white text-sm font-medium mb-4">
                <span>👨‍🏫 Faculty & Staff</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Meet Our Faculty
              </h1>
              <p className="text-gray-600 text-xl max-w-2xl mx-auto mb-8">
                Dedicated educators shaping the future of our students
              </p>
              <div className="flex justify-center gap-4">
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
              </div>
            </div>
          </div>
        
        {/* Content */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FacultySection faculty={safeFaculty} />
          </div>
        </section>
        </div>
        <VibrantFooter {...footerData} />
      </main>
    </ThemeProvider>
  );
}