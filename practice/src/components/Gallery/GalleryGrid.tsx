import React, { useState, useEffect } from 'react';
import type { ImageDto } from '../../types/image';
import '../../assets/styles/grid.css';

interface GalleryGridProps {
  onSelectImage: (images: ImageDto[], index: number) => void;
}

const API_URL = 'http://localhost:5000';

export const GalleryGrid: React.FC<GalleryGridProps> = ({ onSelectImage }) => {
  const [images, setImages] = useState<ImageDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/Gallery/view/grid?userId=1`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Status: ${response.status}`);
        }

        const data = await response.json();
        setImages(data.images || []);
      } catch (err: any) {
        setError(err.message || 'Error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGalleryData();
  }, []);

  if (isLoading) return <div className="status-message">Завантаження...</div>;
  if (error) return <div className="status-message error">{error}</div>;

  return (
    <div className="gallery-grid-container">
      {images.length === 0 ? (
        <div className="status-message">Галерея порожня.</div>
      ) : (
        <div className="grid-layout">
          {images.map((img, index) => (
            <div 
              key={img.id} 
              className="photo-card" 
              onClick={() => onSelectImage(images, index)}
            >
              <img src={`${API_URL}${img.filePath}`} alt={img.fileName} loading="lazy" />
              <div className="photo-card-info">
                <h4>{img.fileName}</h4>
                <p>{new Date(img.uploadDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};