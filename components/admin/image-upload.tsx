'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

// ============================================================================
// T157: IMAGE UPLOAD COMPONENT (Phase 7 - User Story 6)
// ============================================================================

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed maxImages
    if (value.length + files.length > maxImages) {
      setUploadError(`You can only upload up to ${maxImages} images`);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is larger than 5MB`);
        }

        // Create FormData for upload
        const formData = new FormData();
        formData.append('file', file);

        // Upload to API endpoint
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Upload failed');
        }

        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...value, ...uploadedUrls]);
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const canUploadMore = value.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              <Image
                src={url}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled || isUploading}
                className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100 disabled:opacity-50"
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {canUploadMore && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
            aria-label="Upload product images"
          />
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={disabled || isUploading}
            className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-sm font-medium transition-colors hover:border-primary hover:bg-gray-100 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Upload Images ({value.length}/{maxImages})
              </>
            )}
          </button>
        </div>
      )}

      {/* Empty State */}
      {value.length === 0 && !isUploading && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <ImageIcon className="mb-2 h-12 w-12 text-gray-400" />
          <p className="text-sm text-gray-600">
            Click the upload button to add product images
          </p>
          <p className="mt-1 text-xs text-gray-500">
            PNG, JPG, WebP up to 5MB (max {maxImages} images)
          </p>
        </div>
      )}

      {/* Upload Instructions */}
      {value.length > 0 && canUploadMore && (
        <p className="text-xs text-muted-foreground">
          You can upload {maxImages - value.length} more image(s). Maximum file
          size: 5MB per image.
        </p>
      )}

      {/* Error Message */}
      {uploadError && (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {uploadError}
        </div>
      )}
    </div>
  );
}
