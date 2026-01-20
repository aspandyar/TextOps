import { createSlice } from '@reduxjs/toolkit';

const alertsSlice = createSlice({
  name: 'alerts',
  initialState: {
    items: [],
  },
  reducers: {
    addAlert: (state, action) => {
      const alert = {
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      };
      state.items.unshift(alert);
      // Keep only last 50 alerts
      if (state.items.length > 50) {
        state.items.pop();
      }
    },
    removeAlert: (state, action) => {
      state.items = state.items.filter(alert => alert.id !== action.payload);
    },
    clearAlerts: (state) => {
      state.items = [];
    },
  },
});

export const { addAlert, removeAlert, clearAlerts } = alertsSlice.actions;
export default alertsSlice.reducer;
