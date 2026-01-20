import { useDispatch, useSelector } from 'react-redux';

// Typed hooks for use throughout the app
// These provide better type safety when used with TypeScript
// For JavaScript projects, these are optional but recommended for consistency
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
