import { useState } from 'react';

const useUploadImagesAssets = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length == 0) return;
    // Store selected files
    setSelectedFiles((prevFiles) => [...prevFiles, ...(files as File[])]);

    // Generate preview images
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file as File));
    setPreviewImages((prevImages) => [...prevImages, ...newPreviewUrls]);
  };

  const removeImage = (indexToRemove: number) => {
    if (indexToRemove < existingImages.length) {
      // Remove existing image
      setExistingImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
    } else {
      // Remove new image
      const adjustedIndex = indexToRemove - existingImages.length;
      setSelectedFiles((prevFiles) => prevFiles.filter((_, index) => index !== adjustedIndex));
      setPreviewImages((prevImages) => prevImages.filter((_, index) => index !== adjustedIndex));
    }
  };

  const onInputClick = (event: any) => {
    event.target.value = '';
  };

  const clearAllImages = () => {
    setSelectedFiles([]);
    setPreviewImages((prevImages) => {
      // Revoke object URLs to avoid memory leaks
      prevImages.forEach(URL.revokeObjectURL);
      return [];
    });
    setExistingImages([]);
  };

  return {
    selectedFiles,
    previewImages,
    existingImages,
    setPreviewImages,
    setExistingImages,
    handleFileChange,
    removeImage,
    onInputClick,
    setSelectedFiles,
    clearAllImages,
  };
};

export default useUploadImagesAssets;
