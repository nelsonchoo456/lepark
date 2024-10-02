import React, { useState } from 'react';
import { Input } from 'antd';

interface MacAddressInputProps {
  value?: string;
  onChange?: (value: string) => void;
}

const MacAddressInput: React.FC<MacAddressInputProps> = ({ value = '', onChange }) => {
  const [parts, setParts] = useState(value.split(':').concat(Array(6).fill('')).slice(0, 6));

  const handleChange = (index: number, newValue: string) => {
    const newParts = [...parts];
    newParts[index] = newValue.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 2);
    setParts(newParts);
    
    if (onChange) {
      onChange(newParts.join(':'));
    }

    if (newParts[index].length === 2 && index < 5) {
      const nextInput = document.getElementById(`mac-part-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  return (
    <Input.Group compact>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          <Input
            id={`mac-part-${index}`}
            style={{ width: '14%' }}
            value={part}
            onChange={(e) => handleChange(index, e.target.value)}
            maxLength={2}
          />
          {index < 5 && <span style={{ padding: '0 4px' }}>:</span>}
        </React.Fragment>
      ))}
    </Input.Group>
  );
};

export default MacAddressInput;