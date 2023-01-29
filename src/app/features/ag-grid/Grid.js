import React, { useState, useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import rowDataJSON from './rowData';
import currencyContext from '../currencyContext';
import { DropDown, currencyContext } from '../DropDown';
import Button from 'react-bootstrap/Button';
import {
  selectRows,
  addRows,
  removeRows,
  updateRow,
  selectId
} from './slices/rowSlice';
import {
  selectColumns,
  addColumn,
  updateColumns,
  removeColumn
} from './slices/columnSlice';

export const Grid = props => {
  const [gridApi, setGridApi] = useState(null);
  const dispatch = useDispatch();
  const { currency, setCurrency } = useContext(currencyContext);
  const [isUSDColPresent, setIsUSDColPresent] = useState(true);

  const rowData = useSelector(selectRows);
  const columns = useSelector(selectColumns);
  const latestId = useSelector(selectId);

  const currencyMap = {
    GBP: 0.72,
    JPY: 109.38,
    EUR: 0.83
  };

  const currencyRef = useRef();
  useEffect(() => {
    currencyRef.current = currency;
  });

  useEffect(() => {
    if (gridApi) {
      updateCurrencyRowData(currency);
      updateColumnName();
    }
  }, [currency]);

  const onGridReady = params => {
    dispatch(addColumn(createInitialColumns()));
    dispatch(addRows(rowDataJSON));
    setGridApi(params.api);
  };

  const getRowNodeId = params => {
    return params.id;
  };

  const createInitialColumns = () => {
    let columnDefs = [
      { field: 'transactionDate', cellEditor: 'datePicker', editable: true },
      { field: 'currency' },
      {
        field: 'amountUSD',
        headerName: 'Value in $',
        valueParser: amountParser,
        valueFormatter: amountVarFormatter,
        editable: true
      },
      {
        field: 'amountVar',
        headerName: 'Value in £',
        valueFormatter: amountVarFormatter,
        valueParser: amountParser,
        valueGetter: varColumnValueGetter
      }
    ];
    return columnDefs;
  };

  const updateCurrencyRowData = newCurrency => {
    gridApi.forEachNode(node => {
      let copyOfNode = { ...node.data };
      copyOfNode.amountVar = copyOfNode.amountUSD * currencyMap[newCurrency];
      dispatch(updateRow(copyOfNode));
    });
  };

  const updateColumnName = () => {
    let currentColDefs = columns;
    let amountVarColIndex = currentColDefs.findIndex(
      col => col.field === 'amountVar'
    );
    let amountVarCol = { ...currentColDefs[amountVarColIndex] };
    switch (currency) {
      case 'GBP':
        amountVarCol.headerName = 'Value in £';
        break;
      case 'JPY':
        amountVarCol.headerName = 'Value in ¥';
        break;
      case 'EUR':
        amountVarCol.headerName = 'Value in €';
        break;
    }
    dispatch(updateColumns(amountVarCol));
  };

  const addUSDAmountCol = () => {
    let colDef = {
      field: 'amountUSD',
      headerName: 'Value in $',
      valueParser: amountParser,
      valueFormatter: amountVarFormatter
    };
    return colDef;
  };

  const getSelectedRows = () => {
    let selectedRows = gridApi.getSelectedRows();
    return selectedRows.map(row => row.id);
  };

  const createANewRow = () => {
    let newId = latestId + 1;
    let newRow = { id: newId };
    gridApi.getColumnDefs().map(colDef => {
      let field = colDef.field;
      console.log(field);
      if (field == 'amountVar' || field == 'amountUSD') {
        newRow[field] = 0.0;
      } else {
        newRow[field] = 'new';
      }
      return colDef;
    });
    return [newRow];
  };

  const varColumnValueGetter = params => {
    let rowCurrency = currencyRef.current;
    let multiplier = currencyMap[rowCurrency];
    let value = params.node.data.amountUSD * multiplier;
    return value;
  };

  const saveNewValue = params => {
    let field = params.column.colId;
    let newRow = { ...params.data };
    newRow[field] = params.newValue;
    dispatch(updateRow(newRow));
    return false;
  };

  const amountVarFormatter = params => {
    if (!!params.value && (params.value + '').split('.')[1].length > 2) {
      let result = Number(params.value);
      if (currencyRef.current == 'JPY') {
        result = Math.round(result);
      } else {
        result = Math.round((result + Number.EPSILON) * 100) / 100;
      }
      return result;
    }
    return params.value;
  };

  const amountParser = params => {
    let result = isNaN(Number(params.newValue))
      ? params.oldValue
      : params.newValue;
    if ((result + '').indexOf('.') == -1) return result + '.00';
    return result;
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <DropDown />
      &nbsp;
      <Button
        onClick={() => {
          dispatch(removeRows(getSelectedRows()));
        }}
      >
        Remove selected rows
      </Button>
      <Button
        onClick={() => {
          dispatch(addRows(createANewRow()));
        }}
      >
        Add new row
      </Button>
      <Button
        onClick={() => {
          dispatch(removeColumn('amountUSD'));
          setIsUSDColPresent(false);
        }}
        disabled={!isUSDColPresent}
      >
        Remove USD value column
      </Button>
      <Button
        onClick={() => {
          dispatch(addColumn(addUSDAmountCol()));
          setIsUSDColPresent(true);
        }}
        disabled={isUSDColPresent}
      >
        Add USD value column
      </Button>
      <div
        id="myGrid"
        style={{
          height: '100%',
          width: '100%'
        }}
        className="ag-theme-alpine"
      >
        <AgGridReact
          defaultColDef={{
            minWidth: 100,
            valueSetter: saveNewValue,
            flex: 1
          }}
          components={{ datePicker: getDatePicker() }}
          enableRangeSelection={true}
          rowSelection={'multiple'}
          onGridReady={onGridReady}
          rowData={rowData}
          columnDefs={columns}
          getRowNodeId={getRowNodeId}
          immutableData={true}
        />
      </div>
    </div>
  );
};

const getDatePicker = () => {
  const dispatch = useDispatch();
  function Datepicker() {}
  Datepicker.prototype.init = function(params) {
    this.eInput = document.createElement('input');
    this.eInput.value = params.value;
    this.eInput.classList.add('ag-input');
    this.eInput.style.height = '100%';
    $(this.eInput).datepicker({
      onSelect: dateText => {
        let newRow = { ...params.data };
        newRow['transactionDate'] = dateText;
        params.stopEditing();
        dispatch(updateRow(newRow));
      },
      dateFormat: 'D M dd yy'
    });
  };
  Datepicker.prototype.getGui = function() {
    return this.eInput;
  };
  Datepicker.prototype.afterGuiAttached = function() {
    this.eInput.focus();
    this.eInput.select();
  };

  Datepicker.prototype.isCancelAfterEnd = function() {
    return true;
  };

  Datepicker.prototype.getValue = function() {
    return this.eInput.value;
  };
  Datepicker.prototype.destroy = function() {};
  Datepicker.prototype.isPopup = function() {
    return false;
  };
  return Datepicker;
};
