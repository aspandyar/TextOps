import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import './VirtualTable.css';

const VirtualTable = memo(({ data, columns, height = 400, rowHeight = 50 }) => {
  const Row = useMemo(() => ({ index, style }) => {
    const row = data[index];
    return (
      <div style={style} className="virtual-table-row">
        {columns.map((column, colIndex) => (
          <div
            key={colIndex}
            className="virtual-table-cell"
            style={{ width: column.width || 'auto', flex: column.flex || 1 }}
          >
            {column.render ? column.render(row, index) : row[column.key]}
          </div>
        ))}
      </div>
    );
  }, [data, columns]);

  if (data.length === 0) {
    return (
      <div className="virtual-table-empty">
        No data available
      </div>
    );
  }

  return (
    <div className="virtual-table">
      <div className="virtual-table-header">
        {columns.map((column, index) => (
          <div
            key={index}
            className="virtual-table-header-cell"
            style={{ width: column.width || 'auto', flex: column.flex || 1 }}
          >
            {column.header}
          </div>
        ))}
      </div>
      <List
        height={height}
        itemCount={data.length}
        itemSize={rowHeight}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
});

VirtualTable.displayName = 'VirtualTable';

export default VirtualTable;
