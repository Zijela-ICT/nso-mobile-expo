import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ContentItem, Table } from '../../../../types/book.types';

interface TableRendererProps {
  table: Table;
  searchQuery: string;
  highlightText: (text: string, query: string, textStyle?: object) => JSX.Element;
}

const TableRenderer: React.FC<TableRendererProps> = ({ table, searchQuery, highlightText }) => {
  const renderCellContent = (cell: ContentItem, textStyle?: object) => {
    if ('content' in cell && typeof cell.content === 'string') {
      return <Text>{highlightText(cell.content, searchQuery, textStyle)}</Text>;
    }

    if ('items' in cell && Array.isArray(cell.items)) {
      if (cell.type === 'orderedList') {
        return (
          <View>
            {cell.items.map((item, index) => (
              <Text key={index}>
                {highlightText(`${index + 1}. ${typeof item === 'string' ? item : ''}`, searchQuery, textStyle)}
              </Text>
            ))}
          </View>
        );
      } else if (cell.type === 'unorderedList') {
        return (
          <View>
            {cell.items.map((item, index) => (
              <Text key={index}>
                {highlightText(`• ${typeof item === 'string' ? item : ''}`, searchQuery, textStyle)}
              </Text>
            ))}
          </View>
        );
      }
    }

    return null; // Handle unsupported content types
  };

  return (
    <View style={styles.table}>
      {table.title && <Text style={styles.tableTitle}>{table.title}</Text>}

      {/* Render Table Headers */}
      {table.headless && table.headers && table.headers.length > 0 && (
        <View style={styles.tableRow}>
          {table.headers[0].map((header, headerIndex) =>
            'content' in header && typeof header.content === 'string' ? (
              <View
                key={headerIndex}
                style={[
                  styles.tableCell,
                  header.cellStyle, // Apply header cell styles (background, padding, etc.)
                ]}
              >
                <Text>
                  {highlightText(header.content, searchQuery, header.cellStyle)}
                </Text>
              </View>
            ) : null
          )}
        </View>
      )}

      {/* Render Table Rows */}
      {Array.isArray(table.rows) && table.rows.length > 0 && (
        table.rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.tableRow}>
            {row.map((cell, cellIndex) => (
              <View
                key={cellIndex}
                style={[
                  styles.tableCell,
                  cell.cellStyle, // Apply cell-specific styles (background, padding, etc.)
                ]}
              >
                <Text>
                  {renderCellContent(cell)}
                </Text>
              </View>
            ))}
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: '#e0e0e0',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableCell: {
    flex: 1,
    padding: 10,
  },
});

export default TableRenderer;
