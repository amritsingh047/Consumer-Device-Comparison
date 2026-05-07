import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Device } from '../types/device';

interface ComparisonState {
  devices: Device[];
  highlightDiffs: boolean;
  maxDevices: number;
}

const initialState: ComparisonState = { devices: [], highlightDiffs: false, maxDevices: 4 };

const comparisonSlice = createSlice({
  name: 'comparison',
  initialState,
  reducers: {
    addDevice(state, action: PayloadAction<Device>) {
      if (state.devices.find(d => d.id === action.payload.id)) return;
      if (state.devices.length < state.maxDevices) state.devices.push(action.payload);
    },
    removeDevice(state, action: PayloadAction<string>) {
      state.devices = state.devices.filter(d => d.id !== action.payload);
    },
    clearDevices(state) { state.devices = []; },
    toggleHighlightDiffs(state) { state.highlightDiffs = !state.highlightDiffs; },
  },
});

export const { addDevice, removeDevice, clearDevices, toggleHighlightDiffs } = comparisonSlice.actions;
export default comparisonSlice.reducer;
