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
  type?: string;
}

interface FacultyCardsProps {
  faculty: FacultyMember[];
  title?: string;
  subtitle?: string;
}

export function FacultyCards({ faculty }: FacultyCardsProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Faculty Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {faculty.map(member => (
            <Card
              key={member.id}
              className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-none group"
            >
              {/* Photo */}
              <div className="relative h-80 overflow-hidden bg-gray-100">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-linear-to-t from-[#001f3f]/90 via-[#001f3f]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  {member.bio && (
                    <p className="text-white text-sm leading-relaxed line-clamp-4">{member.bio}</p>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-6 bg-white border-t-4 academic-accent-border">
                <h3 className="text-xl font-serif font-bold text-[#001f3f] mb-1">{member.name}</h3>
                <p className="academic-accent font-semibold text-sm mb-1">{member.position}</p>
                {member.type && (
                  <p className="text-sm text-gray-500 mb-2">
                    {member.type === "TEACHER"
                      ? "Guru"
                      : member.type === "STAFF"
                        ? "Tenaga Kependidikan"
                        : member.type}
                  </p>
                )}
                <p className="text-gray-600 text-sm mb-4">{member.department}</p>

                {/* Contact Info */}
                {(member.email || member.phone) && (
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    {member.email && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Mail className="h-4 w-4 academic-accent" />
                        <a
                          href={`mailto:${member.email}`}
                          className="hover:text-[#001f3f] transition-colors truncate"
                        >
                          {member.email}
                        </a>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Phone className="h-4 w-4 academic-accent" />
                        <a
                          href={`tel:${member.phone}`}
                          className="hover:text-[#001f3f] transition-colors"
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
