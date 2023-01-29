import React, { Component, useState, useContext } from 'react';
import currencyContext from './currencyContext.js';

export const DropDown = () => {
  const { currency, setCurrency } = useContext(currencyContext);
  const myFunc = event => {
    setCurrency(event.target.value);
  };

  return (
    <div>
      <label htmlFor="currencyDropdown">Select a Currency:</label>
      <select
        id="currencyDropdown"
        className="form-control"
        name="currency"
        onChange={myFunc}
      >
        <option value="GBP">GBP</option>
        <option value="JPY">JPY</option>
        <option value="EUR">EUR</option>
      </select>
    </div>
  );
};
