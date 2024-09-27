import { useState } from 'react';

const useUploadImagesAssets = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

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
    setSelectedFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
    setPreviewImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
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
  };

  return {
    selectedFiles,
    previewImages,
    setPreviewImages,
    handleFileChange,
    removeImage,
    onInputClick,
    setSelectedFiles,
    clearAllImages,
  };
};

export default useUploadImagesAssets;
