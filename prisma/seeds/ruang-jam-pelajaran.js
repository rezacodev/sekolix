/**
 * Seed data untuk Ruang dan Jam Pelajaran
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Seed data untuk Ruang (Room)
const rooms = [
  // Ruang Kelas
  { code: "R-101", name: "Kelas 1A", type: "CLASSROOM", floor: "1", building: "Gedung A", capacity: 30, facilities: JSON.stringify(["Proyektor", "AC", "Papan Tulis"]), is_active: true },
  { code: "R-102", name: "Kelas 1B", type: "CLASSROOM", floor: "1", building: "Gedung A", capacity: 30, facilities: JSON.stringify(["Proyektor", "AC", "Papan Tulis"]), is_active: true },
  { code: "R-103", name: "Kelas 1C", type: "CLASSROOM", floor: "1", building: "Gedung A", capacity: 30, facilities: JSON.stringify(["Proyektor", "AC", "Papan Tulis"]), is_active: true },
  { code: "R-201", name: "Kelas 2A", type: "CLASSROOM", floor: "2", building: "Gedung A", capacity: 32, facilities: JSON.stringify(["Proyektor", "AC", "Papan Tulis"]), is_active: true },
  { code: "R-202", name: "Kelas 2B", type: "CLASSROOM", floor: "2", building: "Gedung A", capacity: 32, facilities: JSON.stringify(["Proyektor", "AC", "Papan Tulis"]), is_active: true },
  { code: "R-203", name: "Kelas 2C", type: "CLASSROOM", floor: "2", building: "Gedung A", capacity: 32, facilities: JSON.stringify(["Proyektor", "AC", "Papan Tulis"]), is_active: true },
  { code: "R-301", name: "Kelas 3A", type: "CLASSROOM", floor: "3", building: "Gedung A", capacity: 30, facilities: JSON.stringify(["Proyektor", "AC", "Papan Tulis"]), is_active: true },
  { code: "R-302", name: "Kelas 3B", type: "CLASSROOM", floor: "3", building: "Gedung A", capacity: 30, facilities: JSON.stringify(["Proyektor", "AC", "Papan Tulis"]), is_active: true },

  // Laboratorium
  { code: "LAB-IPA-1", name: "Lab IPA 1", type: "LABORATORY", floor: "2", building: "Gedung B", capacity: 40, facilities: JSON.stringify(["Mikroskop", "Alat Praktikum", "AC", "Proyektor"]), is_active: true },
  { code: "LAB-IPA-2", name: "Lab IPA 2", type: "LABORATORY", floor: "2", building: "Gedung B", capacity: 40, facilities: JSON.stringify(["Mikroskop", "Alat Praktikum", "AC", "Proyektor"]), is_active: true },
  { code: "LAB-KOMPUTER", name: "Lab Komputer", type: "LABORATORY", floor: "3", building: "Gedung B", capacity: 36, facilities: JSON.stringify(["30 Unit PC", "AC", "Proyektor", "Printer"]), is_active: true },
  { code: "LAB-BAHASA", name: "Lab Bahasa", type: "LABORATORY", floor: "3", building: "Gedung B", capacity: 30, facilities: JSON.stringify(["Headset", "Audio System", "AC", "Proyektor"]), is_active: true },

  // Perpustakaan
  { code: "PERPUS", name: "Perpustakaan", type: "LIBRARY", floor: "1", building: "Gedung C", capacity: 100, facilities: JSON.stringify(["Koleksi Buku", "Ruang Baca", "AC", "WiFi", "Komputer"]), is_active: true },

  // Ruang Serbaguna
  { code: "AULA", name: "Aula Serbaguna", type: "AUDITORIUM", floor: "1", building: "Gedung D", capacity: 500, facilities: JSON.stringify(["Sound System", "Proyektor", "AC", "Panggung"]), is_active: true },
  { code: "GOR", name: "Gedung Olahraga", type: "SPORTS_HALL", floor: "1", building: "Gedung Olahraga", capacity: 300, facilities: JSON.stringify(["Lapangan Basket", "Lapangan Voli", "Tribun", "Peralatan Olahraga"]), is_active: true },

  // Ruang Kantor
  { code: "GURU", name: "Ruang Guru", type: "OFFICE", floor: "1", building: "Gedung A", capacity: 50, facilities: JSON.stringify(["Meja Kerja", "AC", "WiFi", "Loker"]), is_active: true },
  { code: "TU", name: "Ruang Tata Usaha", type: "OFFICE", floor: "1", building: "Gedung A", capacity: 20, facilities: JSON.stringify(["Komputer", "AC", "Printer", "Filling Cabinet"]), is_active: true },
];

// Seed data untuk Jam Pelajaran (LessonTime)
const lessonTimes = [
  // SENIN
  { day: "MONDAY", session: 1, start_time: "07:00", end_time: "07:45", is_break: false },
  { day: "MONDAY", session: 2, start_time: "07:45", end_time: "08:30", is_break: false },
  { day: "MONDAY", session: 3, start_time: "08:30", end_time: "09:15", is_break: false },
  { day: "MONDAY", session: 4, start_time: "09:15", end_time: "09:30", is_break: true, break_label: "Istirahat 1" },
  { day: "MONDAY", session: 5, start_time: "09:30", end_time: "10:15", is_break: false },
  { day: "MONDAY", session: 6, start_time: "10:15", end_time: "11:00", is_break: false },
  { day: "MONDAY", session: 7, start_time: "11:00", end_time: "11:15", is_break: true, break_label: "Istirahat 2" },
  { day: "MONDAY", session: 8, start_time: "11:15", end_time: "12:00", is_break: false },
  { day: "MONDAY", session: 9, start_time: "12:00", end_time: "12:45", is_break: false },
  { day: "MONDAY", session: 10, start_time: "12:45", end_time: "13:30", is_break: false },

  // SELASA
  { day: "TUESDAY", session: 1, start_time: "07:00", end_time: "07:45", is_break: false },
  { day: "TUESDAY", session: 2, start_time: "07:45", end_time: "08:30", is_break: false },
  { day: "TUESDAY", session: 3, start_time: "08:30", end_time: "09:15", is_break: false },
  { day: "TUESDAY", session: 4, start_time: "09:15", end_time: "09:30", is_break: true, break_label: "Istirahat 1" },
  { day: "TUESDAY", session: 5, start_time: "09:30", end_time: "10:15", is_break: false },
  { day: "TUESDAY", session: 6, start_time: "10:15", end_time: "11:00", is_break: false },
  { day: "TUESDAY", session: 7, start_time: "11:00", end_time: "11:15", is_break: true, break_label: "Istirahat 2" },
  { day: "TUESDAY", session: 8, start_time: "11:15", end_time: "12:00", is_break: false },
  { day: "TUESDAY", session: 9, start_time: "12:00", end_time: "12:45", is_break: false },
  { day: "TUESDAY", session: 10, start_time: "12:45", end_time: "13:30", is_break: false },

  // RABU
  { day: "WEDNESDAY", session: 1, start_time: "07:00", end_time: "07:45", is_break: false },
  { day: "WEDNESDAY", session: 2, start_time: "07:45", end_time: "08:30", is_break: false },
  { day: "WEDNESDAY", session: 3, start_time: "08:30", end_time: "09:15", is_break: false },
  { day: "WEDNESDAY", session: 4, start_time: "09:15", end_time: "09:30", is_break: true, break_label: "Istirahat 1" },
  { day: "WEDNESDAY", session: 5, start_time: "09:30", end_time: "10:15", is_break: false },
  { day: "WEDNESDAY", session: 6, start_time: "10:15", end_time: "11:00", is_break: false },
  { day: "WEDNESDAY", session: 7, start_time: "11:00", end_time: "11:15", is_break: true, break_label: "Istirahat 2" },
  { day: "WEDNESDAY", session: 8, start_time: "11:15", end_time: "12:00", is_break: false },
  { day: "WEDNESDAY", session: 9, start_time: "12:00", end_time: "12:45", is_break: false },
  { day: "WEDNESDAY", session: 10, start_time: "12:45", end_time: "13:30", is_break: false },

  // KAMIS
  { day: "THURSDAY", session: 1, start_time: "07:00", end_time: "07:45", is_break: false },
  { day: "THURSDAY", session: 2, start_time: "07:45", end_time: "08:30", is_break: false },
  { day: "THURSDAY", session: 3, start_time: "08:30", end_time: "09:15", is_break: false },
  { day: "THURSDAY", session: 4, start_time: "09:15", end_time: "09:30", is_break: true, break_label: "Istirahat 1" },
  { day: "THURSDAY", session: 5, start_time: "09:30", end_time: "10:15", is_break: false },
  { day: "THURSDAY", session: 6, start_time: "10:15", end_time: "11:00", is_break: false },
  { day: "THURSDAY", session: 7, start_time: "11:00", end_time: "11:15", is_break: true, break_label: "Istirahat 2" },
  { day: "THURSDAY", session: 8, start_time: "11:15", end_time: "12:00", is_break: false },
  { day: "THURSDAY", session: 9, start_time: "12:00", end_time: "12:45", is_break: false },
  { day: "THURSDAY", session: 10, start_time: "12:45", end_time: "13:30", is_break: false },

  // JUMAT (lebih pendek)
  { day: "FRIDAY", session: 1, start_time: "07:00", end_time: "07:40", is_break: false },
  { day: "FRIDAY", session: 2, start_time: "07:40", end_time: "08:20", is_break: false },
  { day: "FRIDAY", session: 3, start_time: "08:20", end_time: "09:00", is_break: false },
  { day: "FRIDAY", session: 4, start_time: "09:00", end_time: "09:15", is_break: true, break_label: "Istirahat" },
  { day: "FRIDAY", session: 5, start_time: "09:15", end_time: "09:55", is_break: false },
  { day: "FRIDAY", session: 6, start_time: "09:55", end_time: "10:35", is_break: false },
  { day: "FRIDAY", session: 7, start_time: "10:35", end_time: "11:00", is_break: true, break_label: "Istirahat Sholat Jumat" },
  { day: "FRIDAY", session: 8, start_time: "11:00", end_time: "11:40", is_break: false },

  // SABTU (aktif secara default, bisa digunakan untuk pembelajaran)
  { day: "SATURDAY", session: 1, start_time: "07:00", end_time: "07:45", is_break: false },
  { day: "SATURDAY", session: 2, start_time: "07:45", end_time: "08:30", is_break: false },
  { day: "SATURDAY", session: 3, start_time: "08:30", end_time: "09:15", is_break: false },
  { day: "SATURDAY", session: 4, start_time: "09:15", end_time: "09:30", is_break: true, break_label: "Istirahat" },
  { day: "SATURDAY", session: 5, start_time: "09:30", end_time: "10:15", is_break: false },
  { day: "SATURDAY", session: 6, start_time: "10:15", end_time: "11:00", is_break: false },

  // MINGGU (aktif secara default, bisa digunakan untuk pembelajaran jika diperlukan)
  { day: "SUNDAY", session: 1, start_time: "07:00", end_time: "07:45", is_break: false },
  { day: "SUNDAY", session: 2, start_time: "07:45", end_time: "08:30", is_break: false },
  { day: "SUNDAY", session: 3, start_time: "08:30", end_time: "09:15", is_break: false },
  { day: "SUNDAY", session: 4, start_time: "09:15", end_time: "09:30", is_break: true, break_label: "Istirahat" },
  { day: "SUNDAY", session: 5, start_time: "09:30", end_time: "10:15", is_break: false },
  { day: "SUNDAY", session: 6, start_time: "10:15", end_time: "11:00", is_break: false },
];

async function seedRuangJamPelajaran() {
  console.log("🌱 Seeding Ruang dan Jam Pelajaran...");

  // Seed Rooms
  console.log("  📍 Seeding Rooms...");
  for (const room of rooms) {
    await prisma.room.upsert({
      where: { code: room.code },
      update: room,
      create: room,
    });
  }
  console.log(`  ✅ ${rooms.length} rooms seeded`);

  // Seed Lesson Times
  console.log("  ⏰ Seeding Lesson Times...");
  for (const lessonTime of lessonTimes) {
    // Cek apakah sudah ada dengan kombinasi day + session
    const existing = await prisma.lessonTime.findFirst({
      where: {
        day: lessonTime.day,
        session: lessonTime.session,
      },
    });

    if (!existing) {
      await prisma.lessonTime.create({
        data: lessonTime,
      });
    } else {
      await prisma.lessonTime.update({
        where: { id: existing.id },
        data: lessonTime,
      });
    }
  }
  console.log(`  ✅ ${lessonTimes.length} lesson times seeded`);

  console.log("✅ Ruang dan Jam Pelajaran seeding completed!");
}

export { seedRuangJamPelajaran };
