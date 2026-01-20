import React, { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { createJob } from '../../store/slices/jobsSlice';
import { addAlert } from '../../store/slices/alertsSlice';
import FileUpload from './FileUpload';
import JobTypeSelector from './JobTypeSelector';
import { validateJobOptions } from '../../utils/validators';
import './JobForm.css';

const JobForm = () => {
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      jobType: '',
      options: {},
    },
  });

  const jobType = watch('jobType');
  const options = watch('options');

  // Async validation for job type
  const validateJobTypeAsync = useCallback(async (value) => {
    if (!value) {
      return 'Job type is required';
    }
    // Simulate async validation
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
  }, []);

  // Async validation for file
  const validateFileAsync = useCallback(async () => {
    if (!selectedFile) {
      return 'File is required';
    }
    return true;
  }, [selectedFile]);

  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
  }, []);

  const handleJobTypeChange = useCallback((value) => {
    setValue('jobType', value, { shouldValidate: true });
  }, [setValue]);

  const handleOptionsChange = useCallback((key, value) => {
    setValue('options', { ...options, [key]: value }, { shouldValidate: true });
  }, [options, setValue]);

  const onSubmit = useCallback(async (data) => {
    if (!selectedFile) {
      dispatch(addAlert({
        type: 'error',
        message: 'Please select a file',
      }));
      return;
    }

    // Validate options
    const optionErrors = validateJobOptions(data.jobType, data.options);
    if (optionErrors.length > 0) {
      dispatch(addAlert({
        type: 'error',
        message: optionErrors[0],
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      const jobData = {
        file: selectedFile,
        jobType: data.jobType,
        options: data.options,
      };

      await dispatch(createJob(jobData)).unwrap();
      
      dispatch(addAlert({
        type: 'success',
        message: 'Job created successfully',
      }));

      reset();
      setSelectedFile(null);
    } catch (error) {
      dispatch(addAlert({
        type: 'error',
        message: error || 'Failed to create job',
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedFile, dispatch, reset]);

  const showSortOptions = useMemo(() => jobType === 'sort', [jobType]);
  const showDedupOptions = useMemo(() => jobType === 'dedup', [jobType]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="job-form">
      <h3 className="job-form-title">Create New Job</h3>

      <div className="form-group">
        <JobTypeSelector
          value={jobType}
          onChange={handleJobTypeChange}
          error={errors.jobType?.message}
          disabled={isSubmitting}
        />
        <input
          type="hidden"
          {...register('jobType', {
            validate: validateJobTypeAsync,
          })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">File Upload *</label>
        <FileUpload
          onFileSelect={handleFileSelect}
          error={errors.file?.message}
          disabled={isSubmitting}
        />
        <input
          type="hidden"
          {...register('file', {
            validate: validateFileAsync,
          })}
        />
      </div>

      {showSortOptions && (
        <div className="form-group">
          <label className="form-label">Sort Order</label>
          <select
            {...register('options.order')}
            onChange={(e) => handleOptionsChange('order', e.target.value)}
            className="form-select"
            disabled={isSubmitting}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      )}

      {showDedupOptions && (
        <div className="form-group">
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              {...register('options.caseSensitive')}
              onChange={(e) => handleOptionsChange('caseSensitive', e.target.checked)}
              disabled={isSubmitting}
            />
            Case Sensitive
          </label>
        </div>
      )}

      <button
        type="submit"
        className="job-form-submit"
        disabled={isSubmitting || !jobType || !selectedFile}
      >
        {isSubmitting ? 'Creating...' : 'Create Job'}
      </button>
    </form>
  );
};

export default JobForm;
