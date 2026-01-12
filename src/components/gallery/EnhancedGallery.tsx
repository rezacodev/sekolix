"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download, Share2 } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category?: string;
  album?: string;
}

interface EnhancedGalleryProps {
  images: GalleryImage[];
  layout?: "masonry" | "grid";
  columns?: 2 | 3 | 4;
  enableLazyLoad?: boolean;
  showAlbumFilter?: boolean;
  filterTheme?: "modern" | "academic" | "minimal";
}

export default function EnhancedGallery({
  images,
  layout = "masonry",
  columns = 3,
  enableLazyLoad = true,
  showAlbumFilter = true,
  filterTheme = "modern"
}: EnhancedGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Get unique albums/categories
  const albums = [
    "all",
    ...Array.from(
      new Set(
        images.map(img => img.album || img.category).filter((val): val is string => Boolean(val))
      )
    )
  ];

  // Filter images
  const filteredImages =
    filter === "all" ? images : images.filter(img => (img.album || img.category) === filter);

  const selectedImage = selectedIndex !== null ? filteredImages[selectedIndex] : null;

  // Get filter button styles based on theme
  const getFilterButtonStyle = (isActive: boolean) => {
    if (filterTheme === "academic") {
      return isActive
        ? "bg-blue-900 text-white border-2 border-blue-900"
        : "bg-white text-blue-900 border-2 border-blue-200 hover:border-blue-400";
    } else if (filterTheme === "minimal") {
      return isActive
        ? "bg-slate-900 text-white"
        : "bg-white text-slate-900 border border-slate-300 hover:bg-slate-50";
    } else {
      // modern
      return isActive
        ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg scale-105"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200";
    }
  };

  // Navigation functions defined before useEffect
  const handlePrevious = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex(prev => (prev === 0 ? filteredImages.length - 1 : prev! - 1));
    setZoomLevel(1);
  }, [selectedIndex, filteredImages.length]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex(prev => (prev! + 1) % filteredImages.length);
    setZoomLevel(1);
  }, [selectedIndex, filteredImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      switch (e.key) {
        case "Escape":
          setSelectedIndex(null);
          setZoomLevel(1);
          break;
        case "ArrowLeft":
          handlePrevious();
          break;
        case "ArrowRight":
          handleNext();
          break;
        case "+":
        case "=":
          setZoomLevel(prev => Math.min(prev + 0.2, 3));
          break;
        case "-":
          setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, filteredImages.length, handlePrevious, handleNext]);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!enableLazyLoad) return;

    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const imgId = entry.target.getAttribute("data-img-id");
            if (imgId) {
              setLoadedImages(prev => new Set(prev).add(imgId));
            }
          }
        });
      },
      { rootMargin: "50px" }
    );

    return () => observerRef.current?.disconnect();
  }, [enableLazyLoad]);

  const shouldLoadImage = (imgId: string) => {
    return !enableLazyLoad || loadedImages.has(imgId);
  };

  const getGridClass = () => {
    if (layout === "masonry") {
      return `columns-1 md:columns-${Math.min(columns, 2)} lg:columns-${columns} gap-4 space-y-4`;
    }
    return `grid grid-cols-1 md:grid-cols-${Math.min(columns, 2)} lg:grid-cols-${columns} gap-4`;
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Album Filter */}
        {showAlbumFilter && albums.length > 1 && (
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-3">
              {albums.map(album => (
                <button
                  key={album}
                  onClick={() => setFilter(album || "all")}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${getFilterButtonStyle(
                    filter === album
                  )}`}
                >
                  {album === "all"
                    ? "Semua"
                    : (album?.charAt(0).toUpperCase() ?? "") + (album?.slice(1) ?? "")}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        <div className={getGridClass()}>
          {filteredImages.map((image, index) => (
            <GalleryItem
              key={image.id}
              image={image}
              index={index}
              shouldLoad={shouldLoadImage(image.id)}
              observerRef={observerRef}
              onClick={() => setSelectedIndex(index)}
              layout={layout}
            />
          ))}
        </div>

        {/* Enhanced Lightbox Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-fade-in"
            onClick={() => {
              setSelectedIndex(null);
              setZoomLevel(1);
            }}
          >
            {/* Close Button */}
            <button
              onClick={e => {
                e.stopPropagation();
                setSelectedIndex(null);
                setZoomLevel(1);
              }}
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Buttons */}
            {filteredImages.length > 1 && (
              <>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 flex gap-2 z-10">
              <button
                onClick={e => {
                  e.stopPropagation();
                  setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
                }}
                disabled={zoomLevel <= 0.5}
                className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white disabled:opacity-50"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  setZoomLevel(prev => Math.min(prev + 0.2, 3));
                }}
                disabled={zoomLevel >= 3}
                className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white disabled:opacity-50"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <span className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>

            {/* Image Container */}
            <div
              className="relative max-w-6xl max-h-[90vh] w-full overflow-auto"
              onClick={e => e.stopPropagation()}
            >
              <div
                className="relative w-full h-[70vh] transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Image Info */}
              <div className="mt-6 text-center">
                {selectedImage.album && (
                  <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white mb-3">
                    {selectedImage.album}
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-4">{selectedImage.title}</h3>
                <p className="text-sm text-white/70 mb-6">
                  {selectedIndex! + 1} / {filteredImages.length}
                </p>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                  <button className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                  <button className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">
              Use ← → to navigate • ESC to close • +/- to zoom
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </section>
  );
}

// Gallery Item Component with Lazy Loading
interface GalleryItemProps {
  image: GalleryImage;
  index: number;
  shouldLoad: boolean;
  observerRef: React.MutableRefObject<IntersectionObserver | null>;
  onClick: () => void;
  layout: "masonry" | "grid";
}

function GalleryItem({ image, index, shouldLoad, observerRef, onClick, layout }: GalleryItemProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentItem = itemRef.current;
    const currentObserver = observerRef.current;

    if (currentItem && currentObserver) {
      currentObserver.observe(currentItem);
    }

    return () => {
      if (currentItem && currentObserver) {
        currentObserver.unobserve(currentItem);
      }
    };
  }, [observerRef]);

  const heightClass = layout === "masonry" ? "h-auto" : "aspect-square";

  return (
    <div
      ref={itemRef}
      data-img-id={image.id}
      className={`group relative break-inside-avoid rounded-2xl overflow-hidden cursor-pointer ${heightClass} bg-gray-200 dark:bg-gray-800`}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      {shouldLoad ? (
        <div className="relative w-full h-full min-h-[200px]">
          <Image
            src={image.url}
            alt={image.title}
            fill
            className={`object-cover transition-all duration-700 ${
              isLoaded ? "scale-100 blur-0" : "scale-105 blur-sm"
            } group-hover:scale-110`}
            onLoad={() => setIsLoaded(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="w-full h-full min-h-[200px] flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          {image.album && (
            <div className="inline-block px-3 py-1 bg-cyan-500 rounded-full text-sm text-white mb-2">
              {image.album}
            </div>
          )}
          <h3 className="text-xl font-bold text-white">{image.title}</h3>
        </div>

        {/* Zoom Icon */}
        <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-300">
          <ZoomIn className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}
