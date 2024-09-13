import { useState } from 'react';

const useUploadImages = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length == 0) return;
    // Store selected files
    // setSelectedFiles(files as File[]);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files as File[]]);

    // Generate preview images
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file as File));
    // setPreviewImages(previewUrls);
    setPreviewImages((prevImages) => [...prevImages, ...newPreviewUrls]);
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
    setPreviewImages(previewImages.filter((_, index) => index !== indexToRemove));
  };

  const onInputClick = (event: any) => {
		event.target.value = ''
	}

  return {
    selectedFiles,
    previewImages,
    handleFileChange,
    removeImage,
    onInputClick
  };
};

export default useUploadImages;
