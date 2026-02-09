import React, { useState, useCallback, memo } from 'react';
import { validateFile } from '../../utils/validators';
import './FileUpload.css';

const FileUpload = memo(({ onFileSelect, error, disabled }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setValidationError(null);
    setIsValidating(true);

    try {
      const validation = await validateFile(file);
      if (validation.valid) {
        onFileSelect(file);
      } else {
        setValidationError(validation.errors[0]);
        onFileSelect(null);
      }
    } catch {
      setValidationError('File validation failed');
      onFileSelect(null);
    } finally {
      setIsValidating(false);
    }
  }, [onFileSelect]);

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setValidationError(null);
    onFileSelect(null);
  }, [onFileSelect]);

  return (
    <div className="file-upload">
      <label className="file-upload-label">
        <input
          type="file"
          onChange={handleFileChange}
          disabled={disabled || isValidating}
          accept=".txt,.csv,.tsv,.json"
          className="file-upload-input"
        />
        <div className="file-upload-button">
          {isValidating ? 'Validating...' : selectedFile ? 'Change File' : 'Choose File'}
        </div>
      </label>
      
      {selectedFile && (
        <div className="file-upload-info">
          <span className="file-upload-name">{selectedFile.name}</span>
          <span className="file-upload-size">
            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </span>
          <button
            type="button"
            onClick={handleRemove}
            className="file-upload-remove"
            disabled={disabled}
            aria-label="Remove file"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}

      {(error || validationError) && (
        <div className="file-upload-error">
          {error || validationError}
        </div>
      )}
    </div>
  );
});

FileUpload.displayName = 'FileUpload';

export default FileUpload;
