import { MinimalNavbar, MinimalFaculty, MinimalFooter } from "@/components/themes/minimalist-clean";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import prisma from "@/lib/db";
import type { Staff } from "@prisma/client";

// Force dynamic rendering to always fetch fresh theme data
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FacultyPage() {
  // Fetch theme configuration
  const themeConfig =
    (await getThemeConfigById("minimalist-clean")) || getDefaultThemeConfig("minimalist-clean");

  // Fetch staff (teachers/staff) from database
  const staff = await prisma.staff.findMany({
    where: { isActive: true, isVisible: true, role: { in: ["TEACHER", "STAFF"] } },
    orderBy: { order: "asc" }
  });

  const fallback = [
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
    },
    {
      id: "4",
      name: "Mr. David Williams",
      position: "Mathematics Teacher",
      department: "Mathematics",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop",
      email: "d.williams@school.edu",
      phone: "+62 123 456 7894",
      bio: "Making mathematics accessible and fun through innovative teaching methods and real-world applications."
    }
  ];

  const source = staff.length > 0 ? staff : (fallback as unknown as Staff[]);
  const safeFaculty = (source as Array<Staff | (typeof fallback)[number]>).map(member => ({
    id: member.id,
    name: member.name,
    position: member.position ?? (member as Staff).role ?? "",
    department: member.department ?? "",
    image: (member as Staff).image ?? (member as Staff).photo ?? "",
    email: (member as Staff).email ?? undefined,
    phone: (member as Staff).phone ?? undefined,
    bio: (member as Staff).bio ?? undefined,
    type: (member as Staff).role ?? undefined
  }));

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
      youtube: "https://youtube.com/@smkn1jakarta"
    }
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
        <div className="pt-20">
          {/* Page Header - Full Width */}
          <div className="text-center bg-gray-50 py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="inline-flex items-center gap-2 px-4 py-1 border border-gray-300 rounded-full text-gray-600 text-sm mb-4">
                <span>👨‍🏫 Faculty</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Faculty</h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
                Meet the dedicated professionals shaping our educational community
              </p>
              <div className="flex justify-center gap-4">
                <div className="w-16 h-0.5 bg-gray-900"></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <MinimalFaculty faculty={safeFaculty} />
            </div>
          </section>
        </div>
        <MinimalFooter {...footerData} />
      </main>
    </ThemeProvider>
  );
}
