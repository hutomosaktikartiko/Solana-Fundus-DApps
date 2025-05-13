import { createSlice } from "@reduxjs/toolkit";
import { globalStates as GlobalState } from "./states/globalStates";
import { globalActions as GlobalActions } from "./actions/globalActions";

export const globalSlices = createSlice({
  name: "global",
  initialState: GlobalState,
  reducers: GlobalActions,
});

export const globalActions = globalSlices.actions;
export default globalSlices.reducer;
