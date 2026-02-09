// Async file validation
export const validateFile = async (file) => {
  const errors = [];

  // Check file size (max 100MB)
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push('File size exceeds 100MB limit');
  }

  // Check file type
  const allowedTypes = ['text/plain', 'text/csv', 'text/tab-separated-values', 'application/json'];
  const allowedExtensions = ['.txt', '.csv', '.tsv', '.json'];
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
    errors.push('Invalid file type. Allowed: .txt, .csv, .tsv, .json');
  }

  // Simulate async validation (e.g., checking file content)
  return new Promise((resolve) => {
    setTimeout(() => {
      if (errors.length > 0) {
        resolve({ valid: false, errors });
      } else {
        resolve({ valid: true, errors: [] });
      }
    }, 500);
  });
};

// Job type validation
export const validateJobType = (jobType) => {
  const validTypes = ['wordcount', 'dedup', 'clean', 'sort'];
  return validTypes.includes(jobType);
};

// Options validation
export const validateJobOptions = (jobType, options) => {
  const errors = [];

  if (jobType === 'sort') {
    if (options.order && !['asc', 'desc'].includes(options.order)) {
      errors.push('Sort order must be "asc" or "desc"');
    }
  }

  if (jobType === 'dedup') {
    if (options.caseSensitive !== undefined && typeof options.caseSensitive !== 'boolean') {
      errors.push('Case sensitive option must be boolean');
    }
  }

  return errors;
};
