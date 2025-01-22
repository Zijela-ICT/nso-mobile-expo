import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, TextInput, TouchableOpacity, Linking } from 'react-native';
import { FlattenedPage, ContentItem, OrderedList, UnorderedList, Table } from '../../../../types/book.types';
import TableRenderer from './TableRenderer';
import RenderVideo from './RenderVideo';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import RenderInfographic from './renderInfographic';

interface PagesProps {
  flattenedPages: FlattenedPage[];
  currentPageIndex: number;
  setCurrentPageIndex: React.Dispatch<React.SetStateAction<number>>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Pages: React.FC<PagesProps> = ({
  flattenedPages,
  currentPageIndex,
  setCurrentPageIndex,
  searchQuery,
  setSearchQuery,
}) => {
  const [pageSearchQuery, setPageSearchQuery] = useState('');
  const currentPage = flattenedPages[currentPageIndex];


  useEffect(() => {
    setPageSearchQuery(searchQuery?.trim() || ''); // Use optional chaining and default to an empty string
  }, [searchQuery]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPageIndex < flattenedPages.length - 1) {
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const onGestureEvent = (event: any) => {
    const { translationX, state } = event.nativeEvent;

    if (state === State.END) {
      if (translationX > 50) {
        // Swipe Right - Previous Page
        goToPreviousPage();
      } else if (translationX < -50) {
        // Swipe Left - Next Page
        goToNextPage();
      }
    }
  };

  const highlightText = (text: string, query: string, textStyle?: object): JSX.Element => {
    if (!query.trim()) {
      return <Text style={{ ...styles.resultText, ...textStyle }}>{text}</Text>;
    }

    const regex = new RegExp(`(${query})`, 'gi'); // Match the substring anywhere in the text
    const parts = text.split(regex);

    return (
      <Text style={styles.resultText}>
        {parts.map((part, index) => {
          return part.toLowerCase() === query.toLowerCase() ? (
            <Text key={index} style={styles.highlightContainer}>
              {part}
            </Text>
          ) : (
            part
          );
        })}
      </Text>
    );
  };


  const renderUnorderedList = (list: UnorderedList, index: number) => {
    return (
      <View key={index} style={styles.listContainer}>
        {list.items.map((item, itemIndex) => {
          if (typeof item === 'string') {
            return (
              <Text key={itemIndex} style={styles.listItem}>
                {/* • {item} */}
                {highlightText(`• ${item}`, pageSearchQuery)}
              </Text>
            );
          }
          if ('type' in item && item.type === 'text') {
            return (
              <Text key={itemIndex} style={[styles.listItem, item.style]}>
                {/* • {item.content} */}
                {highlightText(`• ${item.content}`, pageSearchQuery)}
              </Text>
            );
          }
          if ('content' in item && typeof item.content === 'string') {
            return (
              <Text key={itemIndex} style={styles.listItem}>
                {/* • {item.content} */}
                {highlightText(`• ${item.content}`, pageSearchQuery)}
              </Text>
            );
          }
          if ('nestedItems' in item && item.nestedItems) {
            // Ensure nestedItems exists
            return renderUnorderedList(item.nestedItems, itemIndex);
          }
          return null; // Handle other nested types if necessary
        })}
      </View>
    );
  };

  const renderOrderedList = (list: OrderedList, index: number) => {
    return (
      <View key={index} style={styles.listContainer}>
        {list.items.map((item, itemIndex) => {
          if (typeof item === 'string') {
            return (
              <Text key={itemIndex} style={styles.listItem}>
                {/* {itemIndex + 1}. {item} */}
                {highlightText(`${itemIndex + 1}. ${item}`, pageSearchQuery)}
              </Text>
            );
          }
          if ('type' in item && item.type === 'text') {
            return (
              <Text key={itemIndex} style={[styles.listItem, item.style]}>
                {/* {itemIndex + 1}. {item.content} */}
                {highlightText(`${itemIndex + 1}. ${item.content}`, pageSearchQuery)}
              </Text>
            );
          }
          if ('content' in item && typeof item.content === 'string') {
            return (
              <Text key={itemIndex} style={styles.listItem}>
                {/* {itemIndex + 1}. {item.content} */}
                {highlightText(`${itemIndex + 1}. ${item.content}`, pageSearchQuery)}
              </Text>
            );
          }
          if ('nestedItems' in item && item.nestedItems) {
            // Ensure nestedItems exists
            return renderOrderedList(item.nestedItems, itemIndex);
          }
          return null; // Handle other nested types if necessary
        })}
      </View>
    );
  };

  const renderContentItem = (item: ContentItem, index: number) => {
    const hasMatch = pageSearchQuery.trim() !== '' && item.type === 'text' && typeof item.content === 'string'
      ? item.content.toLowerCase().includes(pageSearchQuery.toLowerCase())
      : false;

    switch (item.type) {
      case 'text':
        return (
          <Text
            key={index}
            style={[
              item.style || styles.text, // Apply highlight style if there’s a match
            ]}
          >
            {highlightText(item.content, pageSearchQuery)}
          </Text>
        );
      case 'heading1':
        return (
          <Text key={index} style={styles.heading1}>
            {highlightText(item.content, pageSearchQuery)}
          </Text>
        );
      case 'heading2':
        return (
          <Text key={index} style={styles.heading2}>
            {highlightText(item.content, pageSearchQuery)}
          </Text>
        );
      case 'heading3':
        return (
          <Text key={index} style={styles.heading3}>
            {highlightText(item.content, pageSearchQuery)}
          </Text>
        );
      case 'space':
        return <View key={index} style={{ height: 20 }} />;
      case 'infographic':
        return (
          <View key={index} style={styles.infographic}>
            <RenderInfographic url={item.src} index={index} />
          </View>
        );
      case 'video':
        return (
          <RenderVideo video={item} />
        );
      case 'linkable':
        return (
          <View key={index} style={[styles.linkableContainer, item.style]}>
            {item.content.map((link, linkIndex) => (
              <TouchableOpacity
                key={linkIndex}
                onPress={() => {
                  const isExternal = link.linkType === 'external' || !link.linkType; // Default to external
                  const url = link.linkTo;

                  if (isExternal && url) {
                    Linking.openURL(url).catch((err) =>
                      console.error('Failed to open URL:', err)
                    );
                  } else if (link.linkType === 'internal') {
                    // Handle internal navigation logic here
                    console.log('Internal link clicked:', url);
                    // You can integrate with a navigation library like react-navigation
                  }
                }}
              >
                <Text style={[styles.linkableText, link.textStyle]}>{link.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'table':
        return (
          <TableRenderer
            key={index}
            table={item as Table}
            searchQuery={pageSearchQuery}
            highlightText={highlightText}
          />
        );
      case 'unorderedList':
        return renderUnorderedList(item, index);
      case 'orderedList':
        return renderOrderedList(item, index);
      default:
        return null; // Handle other content types if needed
    }
  };


  return (
    <View style={styles.container}>
      <PanGestureHandler onHandlerStateChange={onGestureEvent}>
        <View>
          <Text style={styles.chapterTitle}>{currentPage?.chapterTitle}</Text>
          {currentPage?.subChapterTitle && (
            <Text style={styles.subChapterTitle}>{currentPage?.subChapterTitle}</Text>
          )}
          {currentPage?.subSubChapterTitle && (
            <Text style={styles.subSubChapterTitle}>
              {currentPage?.subSubChapterTitle}
            </Text>
          )}
          <TextInput
            style={styles.searchInput}
            placeholder="Search page..."
            placeholderTextColor="black"
            value={searchQuery}
            // onFocus={() => setIsDropdownVisible(true)}
            // onBlur={() => setIsDropdownVisible(false)}
            onChangeText={handleSearch} // Update search query as the user types
            autoCorrect={false} // Disable auto-correction for better search accuracy
            clearButtonMode="while-editing" // Show clear button while editing (iOS only)
            returnKeyType="search" // Use "search" key for better UX
          />
        </View>
      </PanGestureHandler>
      <View style={styles.pageContent}>
        <ScrollView>
          {currentPage?.content.map((item, index) => renderContentItem(item, index))}
        </ScrollView>
      </View>

      <View style={styles.navigation}>
        <Button
          title="Previous"
          onPress={goToPreviousPage}
          disabled={currentPageIndex === 0}
          color="green"
        />
        <Text style={styles.pageIndicator}>
          {/* Page {currentPageIndex + 1} of {flattenedPages.length} */}
          {currentPageIndex + 1} / {flattenedPages.length}
        </Text>
        <Button
          title="Next"
          onPress={goToNextPage}
          disabled={currentPageIndex === flattenedPages.length - 1}
          color="green"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pageIndicator: {
    fontSize: 16, // Adjust font size for visibility
    fontWeight: '500', // Medium weight
    color: '#333', // Neutral text color
    marginHorizontal: 10, // Add spacing around the text
    alignSelf: 'center', // Center-align within the row
  },
  infographic: {
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  resultText: {
    fontSize: 16, // Adjust font size as per your design
    color: 'black', // Base text color
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  subChapterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black',
  },
  subSubChapterTitle: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 10,
    color: 'black',
  },
  pageContent: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  highlightContainer: {
    backgroundColor: 'yellow',
    color: 'black',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    color: 'black',
  },
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
  tableHeader: {
    fontWeight: 'bold',
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    flex: 1,
    padding: 10,
  },
  listContainer: {
    marginBottom: 10,
  },
  listItem: {
    fontSize: 16,
    marginLeft: 10,
    marginBottom: 5,
  },
  linkableContainer: {
    marginVertical: 10, // Space around linkable content
  },
  linkableText: {
    fontSize: 16,
    color: 'blue',
    textDecorationLine: 'underline',
    marginBottom: 5, // Space between links
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  heading1: {
    fontSize: 24, // Large font size for main headings
    fontWeight: 'bold',
    color: '#333333', // Darker text color
    marginBottom: 10, // Space below the heading
    textAlign: 'left', // Align text to the left
  },
  heading2: {
    fontSize: 20, // Slightly smaller than heading1
    fontWeight: '600', // Semi-bold weight
    color: '#444444', // Slightly lighter color than heading1
    marginBottom: 8, // Space below the heading
    textAlign: 'left', // Align text to the left
  },
  heading3: {
    fontSize: 18, // Smaller than heading2
    fontWeight: '500', // Medium weight
    color: '#555555', // Lighter than heading2
    marginBottom: 6, // Space below the heading
    textAlign: 'left', // Align text to the left
    fontStyle: 'italic', // Italic style for a subtle distinction
  },
});

export default Pages;
