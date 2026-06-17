import React, { useState } from 'react';

const API_URL = 'http://localhost:5000';

export const UploadZone: React.FC = () => {
  const [isDragActive, setIsDragActive] = useState<boolean>(false);

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave" || e.type === "drop") {
      setIsDragActive(false);
    }
  };

  const handleDropEvent = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);

      for (const file of filesArray) {
        if (file.type.startsWith('image/')) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('userId', '1');

          try {
            await fetch(`${API_URL}/api/Gallery/upload`, {
              method: 'POST',
              body: formData,
            });
          } catch (error) {
            console.error(error);
          }
        }
      }
      window.location.reload();
    }
  };

  return (
    <div
      onDragEnter={handleDragEvents}
      onDragOver={handleDragEvents}
      onDragLeave={handleDragEvents}
      onDrop={handleDropEvent}
      style={{
        border: isDragActive ? '2px dashed #007bff' : '2px dashed #ccc',
        backgroundColor: isDragActive ? 'rgba(0,123,255,0.05)' : 'transparent',
        padding: '40px',
        textAlign: 'center',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      <p>Перетягніть графічні файли сюди</p>
    </div>
  );
};