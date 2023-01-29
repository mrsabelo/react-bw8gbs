import React from "react";

 const currencyContext = React.createContext({
  currency: '',
  setCurrency: () => {}
});

export default currencyContext