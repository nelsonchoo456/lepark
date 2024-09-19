import React, { useState, useEffect } from 'react';
import { Input } from 'antd';

interface CustomMACInputProps {
  value?: string;
  onChange?: (value: string) => void;
}

const CustomMACInput: React.FC<CustomMACInputProps> = ({ value = '', onChange }) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    if (value) {
      setInputValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/[^0-9A-Fa-f]/g, ''); // Remove non-hexadecimal characters
    newValue = newValue.replace(/(.{2})(?=.)/g, '$1:'); // Insert colon after every 2 characters
    setInputValue(newValue);
    onChange?.(newValue);
  };

  return (
    <Input
      value={inputValue}
      onChange={handleChange}
      maxLength={17} // Maximum length for a MAC address (XX:XX:XX:XX:XX:XX)
      placeholder="Enter MAC Address"
    />
  );
};

export default CustomMACInput;