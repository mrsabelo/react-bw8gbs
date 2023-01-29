import { configureStore } from '@reduxjs/toolkit';
import rowReducer from './features/ag-grid/slices/rowSlice';
import columnReducer from './features/ag-grid/slices/columnSlice';

export default configureStore({
  reducer: {
    rows: rowReducer,
    columns: columnReducer
  }
});
