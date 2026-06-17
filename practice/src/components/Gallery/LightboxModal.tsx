import React, { useEffect } from 'react';
import type { ImageDto } from '../../types/image';

interface LightboxModalProps {
  images: ImageDto[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}

const API_URL = 'https://localhost:7234';

export const LightboxModal: React.FC<LightboxModalProps> = ({
  images,
  currentIndex,
  onClose,
  onNavigate,
}) => {
  const currentImage = images[currentIndex];

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    onNavigate(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    onNavigate(prevIndex);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowRight') {
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, images]);

  if (!currentImage) return null;

  return (
    <div style={styles.overlay}>
      <button onClick={onClose} style={styles.closeButton}>&times;</button>
      
      <div style={styles.contentContainer}>
        <button onClick={handlePrev} style={styles.navButton}>&#10094;</button>
        <img src={`${API_URL}${currentImage.filePath}`} alt={currentImage.fileName} style={styles.mainImage} />
        <button onClick={handleNext} style={styles.navButton}>&#10095;</button>
      </div>

      <div style={styles.caption}>
        <h3>{currentImage.fileName}</h3>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  contentContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    maxWidth: '1000px'
  },
  mainImage: {
    maxWidth: '80%',
    maxHeight: '75vh',
    borderRadius: '4px',
    boxShadow: '0 0 20px rgba(255,255,255,0.1)'
  },
  closeButton: {
    position: 'absolute',
    top: '20px', right: '30px',
    backgroundColor: 'transparent',
    border: 'none', color: '#fff',
    fontSize: '40px', cursor: 'pointer'
  },
  navButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: 'none', color: '#fff',
    fontSize: '30px', padding: '15px',
    borderRadius: '50%', cursor: 'pointer'
  },
  caption: {
    color: '#fff', marginTop: '15px', textAlign: 'center'
  }
};