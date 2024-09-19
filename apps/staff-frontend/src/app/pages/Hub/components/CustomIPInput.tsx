import React, { useState, useEffect } from 'react';
import { Input } from 'antd';

interface CustomIPInputProps {
  value?: string;
  onChange?: (value: string) => void;
}

const CustomIPInput: React.FC<CustomIPInputProps> = ({ value = '', onChange }) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    if (value) {
      setInputValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/[^0-9.]/g, ''); // Remove non-numeric and non-dot characters
    newValue = newValue.replace(/(\d{3})(?=\d)/g, '$1.'); // Insert dot after every 3 digits
    setInputValue(newValue);
    onChange?.(newValue);
  };

  return (
    <Input
      value={inputValue}
      onChange={handleChange}
      maxLength={15} // Maximum length for an IP address (xxx.xxx.xxx.xxx)
      placeholder="Enter IP Address"
    />
  );
};

export default CustomIPInput;