// src/components/InputField/InputField.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const InputField = ({
  label,
  icon,
  type = 'text',
  id,
  name,
  value,
  onChange,
  onBlur,
  error,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id}>
          {icon && <FontAwesomeIcon icon={icon} className="mr-2" />}
          {label}
        </label>
      )}
      
      {children || (
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          {...props}
        />
      )}
      
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default InputField;