import { createSlice } from '@reduxjs/toolkit';

const systemSlice = createSlice({
  name: 'system',
  initialState: {
    isConnected: false,
    serverStatus: 'disconnected', // 'disconnected' | 'connecting' | 'connected'
    dockerContainers: [],
    selectedContainer: null,
  },
  reducers: {
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
      state.serverStatus = action.payload ? 'connected' : 'disconnected';
    },
    setServerStatus: (state, action) => {
      state.serverStatus = action.payload;
    },
    updateDockerContainers: (state, action) => {
      state.dockerContainers = action.payload;
    },
    setSelectedContainer: (state, action) => {
      state.selectedContainer = action.payload;
    },
  },
});

export const { setConnectionStatus, setServerStatus, updateDockerContainers, setSelectedContainer } = systemSlice.actions;
export default systemSlice.reducer;
