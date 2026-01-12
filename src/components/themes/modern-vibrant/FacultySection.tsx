"use client";

import { Card } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";
import Image from "next/image";

interface FacultyMember {
  id: string;
  name: string;
  position: string;
  department: string;
  image: string;
  email?: string;
  phone?: string;
  bio?: string;
}

interface FacultySectionProps {
  faculty: FacultyMember[];
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
}

export function FacultySection({
  faculty,
  title = "Meet Our Faculty",
  subtitle = "Dedicated educators shaping the future of our students",
  viewAllLink = "/profil/faculty"
}: FacultySectionProps) {
  // Take first 6 faculty members
  const displayFaculty = faculty.slice(0, 6);

  return (
    <section className="py-20 bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
          <div>
            <a
              href={viewAllLink}
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              Lihat semua
            </a>
          </div>
        </div>

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayFaculty.map(member => (
            <Card
              key={member.id}
              className="overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white group hover:-translate-y-2"
            >
              {/* Photo */}
              <div className="relative h-80 overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                {/* Bio Overlay on Hover */}
                {member.bio && (
                  <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
                    <p className="text-white text-sm leading-relaxed text-center line-clamp-6">
                      {member.bio}
                    </p>
                  </div>
                )}

                {/* Name and Position Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                  <h3 className="text-white text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-blue-300 font-medium text-sm mb-1">{member.position}</p>
                  <p className="text-gray-300 text-sm">{member.department}</p>
                </div>
              </div>

              {/* Contact Info */}
              {(member.email || member.phone) && (
                <div className="p-6 bg-white">
                  <div className="space-y-3">
                    {member.email && (
                      <div className="flex items-center gap-3 text-gray-600 text-sm">
                        <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <a
                          href={`mailto:${member.email}`}
                          className="hover:text-blue-600 transition-colors truncate"
                        >
                          {member.email}
                        </a>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-3 text-gray-600 text-sm">
                        <Phone className="h-4 w-4 text-purple-500 flex-shrink-0" />
                        <a
                          href={`tel:${member.phone}`}
                          className="hover:text-purple-600 transition-colors"
                        >
                          {member.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
