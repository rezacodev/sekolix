import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAlbums() {
  try {
    console.log('🌱 Seeding albums...');

    // Create albums
    const albums = [
      {
        name: 'Kegiatan Sekolah',
        description: 'Dokumentasi berbagai kegiatan dan acara sekolah',
      },
      {
        name: 'Prestasi',
        description: 'Koleksi foto prestasi siswa dan sekolah',
      },
      {
        name: 'Fasilitas',
        description: 'Foto-foto fasilitas dan infrastruktur sekolah',
      },
      {
        name: 'Ekstrakurikuler',
        description: 'Kegiatan ekstrakurikuler siswa',
      },
    ];

    const createdAlbums = [];
    for (const album of albums) {
      const created = await prisma.album.upsert({
        where: { name: album.name },
        update: album,
        create: album,
      });
      createdAlbums.push(created);
      console.log(`✅ Created album: ${created.name}`);
    }

    // Get all galleries
    const galleries = await prisma.gallery.findMany({
      orderBy: { order: 'asc' },
    });

    // Assign albums to galleries (distribute evenly)
    for (let i = 0; i < galleries.length; i++) {
      const albumIndex = i % createdAlbums.length;
      await prisma.gallery.update({
        where: { id: galleries[i].id },
        data: { albumId: createdAlbums[albumIndex].id },
      });
      console.log(`📸 Assigned "${galleries[i].title}" to album "${createdAlbums[albumIndex].name}"`);
    }

    console.log('✅ Seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding albums:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAlbums();
