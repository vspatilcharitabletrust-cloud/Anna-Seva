'use client';

import React, { useState, useRef } from 'react';

/**
 * FoodPhotoUploader
 * Allows donors to upload, preview, and manage up to 5 photos of food listings.
 * @param {Array<string>} photos - Array of photo URLs or base64 strings
 * @param {Function} onChange - Callback with updated photos array
 * @param {number} maxPhotos - Maximum allowed photos (default: 5)
 */
export default function FoodPhotoUploader({ photos = [], onChange, maxPhotos = 5 }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  // Compress image client-side to ensure speedy uploads and save storage
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1280;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' }));
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.85
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (fileList) => {
    setErrorMsg('');
    if (!fileList || fileList.length === 0) return;

    const currentCount = photos.length;
    const remainingSlots = maxPhotos - currentCount;

    if (remainingSlots <= 0) {
      setErrorMsg(`You have already uploaded the maximum limit of ${maxPhotos} photos.`);
      return;
    }

    const filesToProcess = Array.from(fileList).slice(0, remainingSlots);

    if (fileList.length > remainingSlots) {
      setErrorMsg(`Only ${remainingSlots} more photo(s) could be added (max ${maxPhotos}).`);
    }

    setUploading(true);
    try {
      const formData = new FormData();
      for (const f of filesToProcess) {
        if (!f.type.startsWith('image/')) {
          setErrorMsg('Only image files (JPG, PNG, WebP) are allowed.');
          continue;
        }
        const compressed = await compressImage(f);
        formData.append('photos', compressed);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.urls) {
        const updated = [...photos, ...data.urls];
        onChange(updated);
      } else {
        setErrorMsg(data.error || 'Failed to upload photos.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setErrorMsg('An error occurred during photo upload.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemovePhoto = (indexToRemove) => {
    const updated = photos.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
    setErrorMsg('');
  };

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
        <label style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
          📸 Food Photos (Up to {maxPhotos} Photos)
        </label>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: photos.length >= maxPhotos ? '#059669' : '#64748b' }}>
          {photos.length} of {maxPhotos} photos added
        </span>
      </div>

      <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.9rem', lineHeight: '1.4' }}>
        Upload clear photos of prepared food, cooking pots, or packaging. This helps recipient NGOs verify quality and dispatch the right collection transport.
      </p>

      {errorMsg && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '0.6rem 0.85rem',
          borderRadius: '8px',
          fontSize: '0.82rem',
          marginBottom: '0.85rem'
        }}>
          {errorMsg}
        </div>
      )}

      {/* Grid of uploaded thumbnails + add button */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
        gap: '0.85rem',
        marginBottom: photos.length < maxPhotos ? '0.85rem' : '0'
      }}>
        {photos.map((url, idx) => (
          <div
            key={idx}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1 / 1',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid rgba(13, 148, 136, 0.3)',
              backgroundColor: '#f8fafc',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.06)'
            }}
          >
            <img
              src={url}
              alt={`Food Photo ${idx + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />

            {/* Photo Index Badge */}
            <span style={{
              position: 'absolute',
              top: '6px',
              left: '6px',
              backgroundColor: 'rgba(9, 14, 26, 0.75)',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '0.15rem 0.45rem',
              borderRadius: '50px',
              backdropFilter: 'blur(4px)'
            }}>
              #{idx + 1}
            </span>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => handleRemovePhoto(idx)}
              title="Remove this photo"
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 800,
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              ✕
            </button>
          </div>
        ))}

        {/* Add photo card inside the grid if slots are remaining */}
        {photos.length < maxPhotos && (
          <div
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              borderRadius: '12px',
              border: isDragging ? '2px dashed var(--accent-teal)' : '2px dashed #cbd5e1',
              backgroundColor: isDragging ? 'rgba(13, 148, 136, 0.06)' : '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: uploading ? 'wait' : 'pointer',
              transition: 'all 0.2s ease',
              padding: '0.5rem',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              if (!uploading) {
                e.currentTarget.style.borderColor = 'var(--accent-teal)';
                e.currentTarget.style.backgroundColor = 'rgba(13, 148, 136, 0.04)';
              }
            }}
            onMouseLeave={(e) => {
              if (!uploading && !isDragging) {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }
            }}
          >
            {uploading ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-teal-dark)', fontWeight: 700 }}>
                ⏳ Uploading...
              </div>
            ) : (
              <>
                <div style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>➕</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                  Add Photo
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                  ({maxPhotos - photos.length} left)
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
        disabled={uploading || photos.length >= maxPhotos}
      />
    </div>
  );
}
