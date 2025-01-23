import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useFetchEbookUrl } from '@/hooks/api/queries/ebooks';
import TableOfContents from './standing-order/TableOfContents';
import Pages from './standing-order/Pages';
import flattenPages from '@/utils/flattenPages';
import { Header } from '@/components';
// import demoData from '../../demo_jchew.json'
import { Book, Chapter } from '../../../types/book.types';

// const { data, isLoading } = useFetchEbookUrl();
// const bookData = data?.book.content;
// const flattenedPages = flattenPages(bookContent);

const App: React.FC = () => {
  const { data } = useFetchEbookUrl();
  // const book = data?.book ?? demoData.book as Book;
  // const book = demoData.book;

  const book = data?.book as Book;
  const bookData = book?.content as Chapter[];
  const flattenedPages = bookData ? flattenPages(bookData) : [];
  const [currentPageIndex, setCurrentPageIndex] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState(''); // State for search query

  return (
    <SafeAreaView style={styles.container}>
     <Header/>
      {book && (
        <TableOfContents
          book={book}
          flattenedPages={flattenedPages}
          onPageSelect={(index) => setCurrentPageIndex(index)}
          searchQuery={searchQuery} // Pass search query state
          setSearchQuery={setSearchQuery} // Pass state updater
        />
      )}
      <Pages
        flattenedPages={flattenedPages}
        currentPageIndex={currentPageIndex}
        setCurrentPageIndex={setCurrentPageIndex}
        searchQuery={searchQuery} // Pass search query to highlight matches
        setSearchQuery={setSearchQuery}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FFFB',
  },
});

export default App;
