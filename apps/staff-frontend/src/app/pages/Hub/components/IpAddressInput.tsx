import React, { useState } from 'react';
import { Input } from 'antd';

interface IpAddressInputProps {
  value?: string;
  onChange?: (value: string) => void;
}

const IpAddressInput: React.FC<IpAddressInputProps> = ({ value = '', onChange }) => {
  const [parts, setParts] = useState(value.split('.').concat(Array(4).fill('')).slice(0, 4));

  const handleChange = (index: number, newValue: string) => {
    const newParts = [...parts];
    newParts[index] = newValue.replace(/[^0-9]/g, '').slice(0, 3);
    if (parseInt(newParts[index]) > 255) {
      newParts[index] = '255';
    }
    setParts(newParts);
    
    if (onChange) {
      onChange(newParts.join('.'));
    }

    if (newParts[index].length === 3 || (newParts[index].length > 0 && parseInt(newParts[index]) > 25)) {
      const nextInput = document.getElementById(`ip-part-${index + 1}`);
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
            id={`ip-part-${index}`}
            style={{ width: '23%' }}
            value={part}
            onChange={(e) => handleChange(index, e.target.value)}
            maxLength={3}
          />
          {index < 3 && <span style={{ padding: '0 4px' }}>.</span>}
        </React.Fragment>
      ))}
    </Input.Group>
  );
};

export default IpAddressInput;