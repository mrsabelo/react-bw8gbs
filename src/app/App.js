import React, { useState } from 'react';
import { Grid } from './features/ag-grid/Grid';
import currencyContext from './features/currencyContext.js';
import './App.css';

function App() {
  const [currency, setCurrency] = useState('GBP');
  const value = { currency, setCurrency };
  return (
    <currencyContext.Provider value={value}>
      <div className="App">
        <Grid />
      </div>
    </currencyContext.Provider>
  );
}

export default App;
