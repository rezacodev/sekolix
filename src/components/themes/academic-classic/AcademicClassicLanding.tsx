import {
  Hero,
  NewsList,
  FacultyCards,
  Timeline,
  TestimonialSection,
  AcademicCalendar,
  Footer,
} from "@/components/themes/academic-classic";

// Sample Data
const sampleNews = [
  {
    id: "1",
    title: "Annual Science Fair Showcases Student Innovation",
    excerpt: "Students presented groundbreaking projects ranging from renewable energy solutions to AI applications, demonstrating exceptional creativity and scientific knowledge.",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop",
    category: "Academic",
    publishedAt: "2025-12-01T10:00:00Z",
    slug: "annual-science-fair-2025",
  },
  {
    id: "2",
    title: "Excellence Academy Wins State Championship",
    excerpt: "Our basketball team secured the state championship title after an intense final match, bringing pride to our school community.",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop",
    category: "Sports",
    publishedAt: "2025-11-28T14:30:00Z",
    slug: "state-championship-win",
  },
  {
    id: "3",
    title: "New STEM Lab Opens with State-of-the-Art Equipment",
    excerpt: "The newly inaugurated STEM laboratory features cutting-edge technology and equipment, providing students with hands-on learning opportunities.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop",
    category: "Facilities",
    publishedAt: "2025-11-25T09:00:00Z",
    slug: "new-stem-lab-opening",
  },
];

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

const sampleTimeline = [
  {
    id: "1",
    year: "1990",
    title: "Foundation",
    description: "Excellence Academy was established with a vision to provide world-class education to aspiring students.",
  },
  {
    id: "2",
    year: "1995",
    title: "First Expansion",
    description: "Built new science laboratories and library facilities to accommodate growing student population.",
  },
  {
    id: "3",
    year: "2000",
    title: "International Recognition",
    description: "Received accreditation from international education bodies, becoming a globally recognized institution.",
  },
  {
    id: "4",
    year: "2010",
    title: "Technology Integration",
    description: "Launched digital learning initiatives with smart classrooms and online learning platforms.",
  },
  {
    id: "5",
    year: "2020",
    title: "Pandemic Adaptation",
    description: "Successfully transitioned to hybrid learning model, ensuring continuity of education during challenging times.",
  },
  {
    id: "6",
    year: "2025",
    title: "Innovation Hub",
    description: "Opened state-of-the-art innovation center focusing on AI, robotics, and sustainable technologies.",
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

export default function AcademicClassicPage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <NewsList news={sampleNews} />
      <FacultyCards faculty={sampleFaculty} />
      <Timeline events={sampleTimeline} />
      <TestimonialSection testimonials={sampleTestimonials} />
      <AcademicCalendar events={sampleEvents} />
      <Footer />
    </main>
  );
}
