import React from 'react';
import JobDetailContainer from '../containers/JobDetailContainer';
import './JobDetailPage.css';

/**
 * Route-level page: delegates to JobDetailContainer (Container/Presenter).
 */
const JobDetailPage = () => {
  return <JobDetailContainer />;
};

export default JobDetailPage;
