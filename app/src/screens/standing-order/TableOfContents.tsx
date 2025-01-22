import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import {
  Book,
  Chapter,
  ContentItem,
  FlattenedPage,
  SubChapter,
  SubSubChapter,
} from '../../../../types/book.types';

interface TableOfContentsProps {
  book: Book;
  flattenedPages: FlattenedPage[];
  onPageSelect: (pageIndex: number) => void;
  searchQuery: string; // Add search query as a prop
  setSearchQuery: (query: string) => void;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  book,
  flattenedPages,
  onPageSelect,
  searchQuery,
  setSearchQuery,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  // const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Control dropdown visibility
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  // const [searchQuery, setSearchQuery] = useState('');

  const toggleSearchModal = () => {
    setSearchQuery(!isSearchModalVisible ? '' : searchQuery);
    setIsSearchModalVisible((prev) => !prev);
  };

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const toggleModal = () => {
    setIsModalVisible((prev) => !prev);
  };

  const toggleExpanded = (key: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const getFilteredResults = () => {
    if (!searchQuery.trim()) {return [];} // Return an empty array if the search query is empty

    return flattenedPages
      .map((page, index) => {
        // Filter matching items based on whether they generate displayText
        const matchingItems = page.content?.filter((contentItem) => {
          if (contentItem.type === 'text' && typeof contentItem.content === 'string') {
            return contentItem.content.toLowerCase().includes(searchQuery.toLowerCase());
          } else if (contentItem.type === 'heading1' || contentItem.type === 'heading2' || contentItem.type === 'heading3') {
            return contentItem.content.toLowerCase().includes(searchQuery.toLowerCase());
          } else if (contentItem.type === 'unorderedList' || contentItem.type === 'orderedList') {
            return contentItem.items.some((item) =>
              typeof item === 'string'
                ? item.toLowerCase().includes(searchQuery.toLowerCase())
                : typeof item.content === 'string' &&
                item.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
          } else if (contentItem.type === 'table') {
            const headersMatch = contentItem.headers?.some((headerRow) =>
              headerRow.some(
                (header) =>
                  'content' in header &&
                  typeof header.content === 'string' &&
                  header.content.toLowerCase().includes(searchQuery.toLowerCase())
              )
            );
            const rowsMatch = contentItem.rows.some((row) =>
              row.some(
                (cell) =>
                  'content' in cell &&
                  typeof cell.content === 'string' &&
                  cell.content.toLowerCase().includes(searchQuery.toLowerCase())
              )
            );

            return headersMatch || rowsMatch;
          } else if (contentItem.type === 'image') {
            return contentItem.alt?.toLowerCase().includes(searchQuery.toLowerCase());
          } else if (contentItem.type === 'video') {
            return contentItem.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              contentItem.title?.toLowerCase().includes(searchQuery.toLowerCase());
          }
          return false;
        });

        // Filter further to exclude results where no matching item generates displayText
        const validMatchingItems = matchingItems?.filter((item) => {
          if (item.type === 'text' && typeof item.content === 'string') {
            const queryIndex = item.content.toLowerCase().indexOf(searchQuery.toLowerCase());
            return queryIndex !== -1;
          } else if (
            (item.type === 'heading1' ||
              item.type === 'heading2' ||
              item.type === 'heading3') &&
            typeof item.content === 'string'
          ) {
            const queryIndex = item.content.toLowerCase().indexOf(searchQuery.toLowerCase());
            return queryIndex !== -1;
          }
          return true; // For other types, assume valid if they matched earlier
        });

        if (validMatchingItems && validMatchingItems.length > 0) {
          return {
            ...page,
            matchingItems: validMatchingItems,
            pageIndex: index, // Include the pageIndex
          };
        }
        return null;
      })
      .filter((result): result is FlattenedPage & { matchingItems: ContentItem[]; pageIndex: number } => result !== null); // Filter out null pages
  };

  const filteredResults = getFilteredResults();

  const findFirstPageIndex = (
    chapterTitle: string,
    subChapterTitle?: string,
    subSubChapterTitle?: string
  ): number => {
    // Normalize inputs (treat undefined and empty strings as equivalent)
    const normalize = (value?: string): string => value?.trim() || '';

    const normalizedChapterTitle = normalize(chapterTitle);
    const normalizedSubChapterTitle = normalize(subChapterTitle);
    const normalizedSubSubChapterTitle = normalize(subSubChapterTitle);

    // Direct match for the current hierarchy level
    const directIndex = flattenedPages.findIndex(
      (page) =>
        normalize(page.chapterTitle) === normalizedChapterTitle &&
        normalize(page.subChapterTitle) === normalizedSubChapterTitle &&
        normalize(page.subSubChapterTitle) === normalizedSubSubChapterTitle
    );

    if (directIndex !== -1) {
      return directIndex; // Return if a direct match is found
    }

    // Search deeper in the hierarchy for pages
    for (const page of flattenedPages) {
      if (
        normalize(page.chapterTitle) === normalizedChapterTitle &&
        normalize(page.subChapterTitle) === normalizedSubChapterTitle
      ) {
        return flattenedPages.findIndex((p) => p === page); // Match deeper hierarchy
      }
    }

    return -1; // Return -1 if no pages found
  };

  const renderHierarchy = (
    chapters: Chapter[] | SubChapter[] | SubSubChapter[],
    level = 0,
    parentKey = '',
    parentChapterTitle = '', // Tracks the chapter title
    parentSubChapterTitle = '' // Tracks the subchapter title
  ): JSX.Element[] => {
    return chapters
      .map((item, index) => {
        if (!item || typeof item !== 'object') {return null;}

        const key = `${parentKey}-${index}`;
        const isExpanded = expandedItems[key];
        const hasSubItems =
          'subChapters' in item ? item.subChapters : 'subSubChapters' in item && item.subSubChapters;

        // Determine the appropriate values for findFirstPageIndex
        const chapterTitle = 'chapter' in item ? item.chapter : parentChapterTitle;
        const subChapterTitle =
          'subChapterTitle' in item ? item.subChapterTitle : parentSubChapterTitle;
        const subSubChapterTitle =
          'subSubChapterTitle' in item ? (item as SubSubChapter).subSubChapterTitle : undefined;

        const onTextClick = () => {
          const firstPageIndex = findFirstPageIndex(
            chapterTitle,
            subChapterTitle,
            subSubChapterTitle
          );

          if (firstPageIndex !== -1) {
            onPageSelect(firstPageIndex);
            setIsModalVisible(false); // Close modal after selecting a page
          }
        };

        const onIconClick = () => {
          toggleExpanded(key);
        };

        return (
          <View key={key} style={{ marginLeft: level * 20, backgroundColor: '#fff' }}>
            <View style={styles.itemContainer}>
              {/* Icon handles expand/collapse */}
              {hasSubItems && (
                <TouchableOpacity onPress={onIconClick}>
                  <Text style={styles.iconText}>{isExpanded ? '▼' : '▶'}</Text>
                </TouchableOpacity>
              )}
              {/* Text handles page selection */}
              <TouchableOpacity
                onPress={onTextClick}
                style={{ marginLeft: hasSubItems ? 10 : 0 }}
              >
                <Text style={styles.itemText}>
                  {'chapter' in item
                    ? item.chapter
                    : 'subChapterTitle' in item
                      ? item.subChapterTitle
                      : (item as SubSubChapter).subSubChapterTitle}
                </Text>
              </TouchableOpacity>
            </View>
            {isExpanded && hasSubItems && (
              <View style={styles.nestedContainer}>
                {renderHierarchy(
                  hasSubItems,
                  level + 1,
                  key,
                  chapterTitle, // Pass down the current chapter title
                  subChapterTitle // Pass down the current subchapter title
                )}
              </View>
            )}
          </View>
        );
      })
      .filter((element): element is JSX.Element => element !== null);
  };

  return (
    <View style={{ backgroundColor: '#fff' }}>
      {/* Dropdown Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.dropdownHeader} onPress={toggleModal}>
          <Text style={styles.dropdownHeaderText}>Table of Contents ▼</Text>
        </TouchableOpacity>
        {/* Search Button */}
        <TouchableOpacity style={styles.searchButton} onPress={toggleSearchModal}>
          <Text style={styles.searchButtonText}>🔍 Search Standing Order</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Table of Contents */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={toggleModal} // Allows back button on Android to close modal
      >
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={styles.modalContent}>
                <Text style={styles.title}>{book.bookTitle}</Text>
                <ScrollView style={styles.dropdownContent}>
                  {renderHierarchy(book.content)}
                </ScrollView>
                <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Search Modal */}
      <Modal
        visible={isSearchModalVisible}
        transparent
        animationType="slide"
        onRequestClose={toggleSearchModal}
      >
        <TouchableWithoutFeedback onPress={toggleSearchModal}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={styles.modalContent}>

                <TextInput
                  style={styles.searchInput}
                  placeholder="Search content..."
                  placeholderTextColor="black"
                  value={searchQuery}
                  onChangeText={handleSearch} // Update search query as the user types
                  autoCorrect={false} // Disable auto-correction for better search accuracy
                  clearButtonMode="while-editing" // Show clear button while editing (iOS only)
                  returnKeyType="search" // Use "search" key for better UX
                />
                <ScrollView style={styles.dropdownContent}>
                  {filteredResults
                    .map((result, index) => {
                      return (
                        <View key={index} style={styles.resultContainer}>
                          <TouchableOpacity
                            key={index}
                            style={styles.resultItem}
                            onPress={() => {
                              if (result.pageIndex !== undefined) {
                                onPageSelect(result.pageIndex); // Use the pageIndex directly
                                toggleSearchModal(); // Close the search modal
                              }
                            }}
                          >
                            <Text style={{ color: 'black' }}>
                              <Text style={{color: '#036B26'}}>Page {result.pageIndex + 1}</Text>
                              {'\n'}
                              {result.chapterTitle}
                              {'\n'}
                              {result.subChapterTitle || ''}
                              {'\n'}
                              {result.subSubChapterTitle || ''}
                            </Text>
                          </TouchableOpacity>
                          <View style={styles.matchingItemsContainer}>
                            <ScrollView style={styles.matchingItemsScroll} nestedScrollEnabled
                            contentContainerStyle={styles.scrollContent}
                            >
                              {result.matchingItems.map((item, itemIndex) => {
                                const query = searchQuery.toLowerCase();
                                let displayText = '';
                                let contentType = ''; // To hold the type of content (e.g., Text, Table, Image)

                                if (item.type === 'text' && typeof item.content === 'string') {
                                  const content = item.content;
                                  const queryIndex = content.toLowerCase().indexOf(query);

                                  if (queryIndex !== -1) {
                                    // Original snippet indices
                                    const rawStart = Math.max(0, queryIndex - 50); // Show 50 characters before the query
                                    const rawEnd = Math.min(content.length, queryIndex + query.length + 50); // Show 50 characters after the query

                                    // Adjust to word boundaries
                                    const adjustToWordBoundaries = (text: string, start: number, end: number): [number, number] => {
                                      // Adjust start backward to the nearest whitespace or punctuation
                                      while (start > 0 && !/\s|\W/.test(text[start - 1])) {
                                        start--;
                                      }

                                      // Adjust end forward to the nearest whitespace or punctuation
                                      while (end < text.length && !/\s|\W/.test(text[end])) {
                                        end++;
                                      }

                                      return [start, end];
                                    };

                                    const [start, end] = adjustToWordBoundaries(content, rawStart, rawEnd);

                                    // Extract snippet with adjusted boundaries
                                    const snippet = content.substring(start, end);

                                    displayText = snippet.trim();
                                    contentType = 'Text';
                                  }
                                }
                                else if (
                                  item.type === 'heading1' ||
                                  item.type === 'heading2' ||
                                  item.type === 'heading3'
                                ) {
                                  const content = item.content;
                                  const queryIndex = content.toLowerCase().indexOf(query);

                                  if (queryIndex !== -1) {
                                    displayText = `Heading: ${content.trim()}`;
                                    contentType = 'Heading';
                                  }
                                }
                                else if (item.type === 'orderedList') {
                                  const matchingItems = item.items.filter((listItem) => {
                                    if (typeof listItem === 'string') {
                                      return listItem.toLowerCase().includes(query);
                                    } else if (typeof listItem === 'object' && listItem !== null && 'text' in listItem) {
                                      const text = (listItem as { text: string }).text; // Type assertion to access `text`
                                      return text.toLowerCase().includes(query);
                                    }
                                    return false; // Handle cases where the structure doesn't match
                                  });

                                  if (matchingItems.length > 0) {
                                    displayText = matchingItems
                                      .map((listItem, idx) => {
                                        if (typeof listItem === 'string') {
                                          return `${idx + 1}. ${listItem}`; // Format as a numbered list
                                        } else if (typeof listItem === 'object' && listItem !== null && 'text' in listItem) {
                                          const text = (listItem as { text: string }).text;
                                          return `${idx + 1}. ${text}`;
                                        }
                                        return ''; // Default case for unhandled structures
                                      })
                                      .join('\n');
                                    contentType = 'Ordered List';
                                  }
                                } else if (item.type === 'unorderedList') {
                                  const matchingItems = item.items.filter((listItem) => {
                                    if (typeof listItem === 'string') {
                                      return listItem.toLowerCase().includes(query);
                                    } else if (typeof listItem === 'object' && listItem !== null && 'text' in listItem) {
                                      const text = (listItem as { text: string }).text; // Type assertion to access `text`
                                      return text.toLowerCase().includes(query);
                                    }
                                    return false; // Handle cases where the structure doesn't match
                                  });

                                  if (matchingItems.length > 0) {
                                    displayText = matchingItems
                                      .map((listItem) => {
                                        if (typeof listItem === 'string') {
                                          return `• ${listItem}`; // Format as a bullet list
                                        } else if (typeof listItem === 'object' && listItem !== null && 'text' in listItem) {
                                          const text = (listItem as { text: string }).text;
                                          return `• ${text}`;
                                        }
                                        return ''; // Default case for unhandled structures
                                      })
                                      .join('\n');
                                    contentType = 'Unordered List';
                                  }
                                }

                                else if (item.type === 'table') {
                                  const headersMatch = item.headers?.some((headerRow) =>
                                    headerRow.some(
                                      (header) =>
                                        'content' in header &&
                                        typeof header.content === 'string' &&
                                        header.content.toLowerCase().includes(query)
                                    )
                                  );

                                  const rowsMatch = item.rows.some((row) =>
                                    row.some(
                                      (cell) =>
                                        'content' in cell &&
                                        typeof cell.content === 'string' &&
                                        cell.content.toLowerCase().includes(query)
                                    )
                                  );

                                  if (headersMatch || rowsMatch) {
                                    displayText = 'Match found in Table';
                                    contentType = 'Table';
                                  }
                                } else if (item.type === 'image') {
                                  if (item.alt?.toLowerCase().includes(query)) {
                                    displayText = `Image Alt: ${item.alt}`;
                                    contentType = 'Image';
                                  }
                                } else if (item.type === 'video') {
                                  if (
                                    item.description?.toLowerCase().includes(query) ||
                                    item.title?.toLowerCase().includes(query)
                                  ) {
                                    displayText = `Video: ${item.title || item.description}`;
                                    contentType = 'Video';
                                  }
                                }

                                // Skip rendering if there is no valid displayText
                                if (!displayText) {return null;}

                                return (
                                  <View key={itemIndex} style={styles.matchingItemContainer}>
                                    <Text style={styles.matchingItemType}>{contentType}</Text>
                                    <Text style={styles.matchingItemText}>
                                      {displayText.split(new RegExp(`(${searchQuery})`, 'i')).map(
                                        (part, index) => (
                                          <Text
                                            key={index}
                                            style={
                                              part.toLowerCase() === query ? styles.highlight : undefined
                                            }
                                          >
                                            {part}
                                          </Text>
                                        )
                                      )}
                                    </Text>
                                  </View>
                                );
                              })}
                            </ScrollView>
                          </View>
                        </View>
                      );
                    })}
                  {filteredResults.length === 0 && (
                    <Text style={styles.noResultsText}>No results found.</Text>
                  )}
                </ScrollView>

                <TouchableOpacity style={styles.closeButton} onPress={toggleSearchModal}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    position: 'absolute',
    top: 50, // Position below the search input
    left: 10,
    right: 10,
    zIndex: 10, // Ensure it appears above other elements
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 300, // Limit the height of the dropdown
  },
  highlight: {
    backgroundColor: 'yellow',
    color: 'black',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
  },
  matchingItemContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  matchingItemType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007BFF', // Distinct color for content type
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
  dropdownContent: {
    maxHeight: 300,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  itemContainer: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  itemText: {
    fontSize: 16,
    color: 'black',
  },
  nestedContainer: {
    paddingLeft: 10,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  iconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#555',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    // paddingHorizontal: 10, // Optional: Add padding for better alignment
  },
  dropdownHeader: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  dropdownHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  searchButton: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginLeft: 10,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9', // Light background for better contrast
    color: 'black', // Ensure text is visible
  },
  resultItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff', // White background for individual result
    borderRadius: 5,
    marginBottom: 10, // Space between result items
  },
  resultText: {
    fontSize: 16,
    color: 'black',
    fontWeight: '400',
  },
  noResultsText: {
    fontSize: 16,
    color: '#888', // Light gray for subtle "no results" message
    textAlign: 'center',
    marginTop: 20,
  },
  resultContainer: {
    marginBottom: 15, // Space between result containers
    padding: 10,
    backgroundColor: '#f8f8f8', // Light gray background for better visibility
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd', // Subtle border for separation
  },
  matchingItemsContainer: {
    marginTop: 10, // Space between the result header and matching items
    paddingLeft: 10, // Indentation for nested items
    borderLeftWidth: 2,
    borderLeftColor: '#ccc', // Subtle vertical line for hierarchy
    maxHeight: 150, // Fixed height for the container
    overflow: 'hidden',
  },
  matchingItemsScroll: {
    flexGrow: 1,
    },
  matchingItemText: {
    fontSize: 14,
    color: '#555', // Slightly muted color to differentiate from headers
    marginBottom: 5, // Space between matching items
  },
  scrollContent: {
    paddingVertical: 10, // Padding inside the scroll view
  },
});

export default TableOfContents;
