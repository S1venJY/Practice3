import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { UploadZone } from './components/Upload/UploadZone';
import { GalleryGrid } from './components/Gallery/GalleryGrid';
import { LightboxModal } from './components/Gallery/LightboxModal';
import type { ImageDto } from './types/image';

const GalleryApp: React.FC = () => {
  const [lightboxImages, setLightboxImages] = useState<ImageDto[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(-1);

  const handleSelectImage = (images: ImageDto[], index: number) => {
    setLightboxImages(images);
    setCurrentImageIndex(index);
  };

  const handleCloseLightbox = () => {
    setCurrentImageIndex(-1);
    setLightboxImages([]);
  };

  const handleNavigateLightbox = (nextIndex: number) => {
    setCurrentImageIndex(nextIndex);
  };

  return (
    <div style={{ padding: '20px', minHeight: '100vh' }}>
      <Header />
      <Sidebar />
      <main>
        <UploadZone />
        <GalleryGrid onSelectImage={handleSelectImage} />
      </main>

      {currentImageIndex >= 0 && (
        <LightboxModal
          images={lightboxImages}
          currentIndex={currentImageIndex}
          onClose={handleCloseLightbox}
          onNavigate={handleNavigateLightbox}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <GalleryApp />
    </ThemeProvider>
  );
}