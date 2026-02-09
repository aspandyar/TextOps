import React, { memo } from 'react';
import './JobTypeSelector.css';

const JOB_TYPES = [
  { value: 'wordcount', label: 'Word Count', description: 'Count words in text file' },
  { value: 'dedup', label: 'Remove Duplicates', description: 'Remove duplicate lines' },
  { value: 'clean', label: 'Clean Trash', description: 'Remove empty lines and trim whitespace' },
  { value: 'sort', label: 'Sort Numbers', description: 'Sort numeric values' },
];

const JobTypeSelector = memo(({ value, onChange, error, disabled }) => {
  return (
    <div className="job-type-selector">
      <label className="job-type-label">Job Type *</label>
      <div className="job-type-options">
        {JOB_TYPES.map((type) => (
          <div
            key={type.value}
            className={`job-type-option ${value === type.value ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && onChange(type.value)}
          >
            <div className="job-type-option-header">
              <input
                type="radio"
                name="jobType"
                value={type.value}
                checked={value === type.value}
                onChange={() => !disabled && onChange(type.value)}
                disabled={disabled}
                className="job-type-radio"
              />
              <span className="job-type-option-label">{type.label}</span>
            </div>
            <p className="job-type-option-description">{type.description}</p>
          </div>
        ))}
      </div>
      {error && <div className="job-type-error">{error}</div>}
    </div>
  );
});

JobTypeSelector.displayName = 'JobTypeSelector';

export default JobTypeSelector;
