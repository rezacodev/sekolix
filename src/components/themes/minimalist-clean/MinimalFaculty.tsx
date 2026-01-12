"use client";

import { Card } from "@/components/ui/card";
import { Mail, Phone, ArrowRight } from "lucide-react";
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

interface MinimalFacultyProps {
  faculty: FacultyMember[];
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
}

export function MinimalFaculty({
  faculty,
  title = "Our Faculty",
  subtitle = "Meet the dedicated professionals shaping our educational community",
  viewAllLink = "/profil/faculty"
}: MinimalFacultyProps) {
  // Take first 6 faculty members
  const displayFaculty = faculty.slice(0, 6);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
              Lihat semua <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayFaculty.map(member => (
            <Card
              key={member.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white group"
            >
              {/* Photo */}
              <div className="relative h-64 overflow-hidden bg-gray-100">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-gray-600 font-medium text-sm mb-1">{member.position}</p>
                <p className="text-gray-500 text-sm mb-4">{member.department}</p>

                {/* Bio */}
                {member.bio && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{member.bio}</p>
                )}

                {/* Contact Info */}
                {(member.email || member.phone) && (
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    {member.email && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a
                          href={`mailto:${member.email}`}
                          className="hover:text-gray-900 transition-colors truncate"
                        >
                          {member.email}
                        </a>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a
                          href={`tel:${member.phone}`}
                          className="hover:text-gray-900 transition-colors"
                        >
                          {member.phone}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
