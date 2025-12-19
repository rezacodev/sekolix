'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
}

interface BorderlessGalleryProps {
  images: GalleryImage[];
  title: string;
  viewAllLink?: string;
}

export default function BorderlessGallery({ images, title, viewAllLink = "/gallery" }: BorderlessGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(images.map((img) => img.category)))];
  const filteredImages =
    filter === 'all' ? images : images.filter((img) => img.category === filter);

  return (
    <section className="py-32 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-20">
          <h2 className="text-5xl md:text-6xl font-light text-slate-900 mb-8">
            {title}
          </h2>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-6 py-2 text-sm uppercase tracking-wider transition-all duration-300 ${
                  filter === category
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Borderless Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden cursor-pointer bg-slate-200"
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative w-full h-full">
                <Image
                  src={image.url}
                  alt={image.title}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
                />
              </div>

              {/* Overlay on Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-center text-white">
                  <p className="text-sm uppercase tracking-wider mb-2">
                    {image.category}
                  </p>
                  <h3 className="text-xl font-light">{image.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-6xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[80vh]">
              <Image
                src={selectedImage.url}
                alt={selectedImage.title}
                fill
                className="object-contain"
              />
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm uppercase tracking-wider text-slate-500 mb-2">
                {selectedImage.category}
              </p>
              <h3 className="text-3xl font-light text-slate-900">
                {selectedImage.title}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* View All Link */}
      <div className="mt-20 text-center">
        <a
          href={viewAllLink}
          className="inline-flex items-center gap-3 text-lg text-slate-900 border-b-2 border-slate-900 pb-1 hover:gap-5 transition-all duration-300"
        >
          <span className="font-medium">View All Gallery</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </section>
  );
}
