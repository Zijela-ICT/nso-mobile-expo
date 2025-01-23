import React from "react";
import { SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import { useFetchEbookUrl } from "@/hooks/api/queries/ebooks";
import TableOfContents from "./standing-order/TableOfContents";
import Icon from "@expo/vector-icons/Ionicons";
import Pages from "./standing-order/Pages";
import flattenPages from "@/utils/flattenPages";
import { Header } from "@/components";
// import demoData from '../../demo_jchew.json'
import { Book, Chapter } from "../../../types/book.types";

const App: React.FC = () => {
  const { data, refetch, isRefetching} = useFetchEbookUrl();

  const book = data?.book as Book;
  const bookData = book?.content as Chapter[];
  const flattenedPages = bookData ? flattenPages(bookData) : [];
  const [currentPageIndex, setCurrentPageIndex] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState(""); // State for search query

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <TouchableOpacity style={styles.refreshButton} onPress={()=>refetch()}>
        <Icon name="refresh-outline" size={24} color="black" />
      </TouchableOpacity>
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
    backgroundColor: "#F8FFFB"
  },
  refreshButton: {
    display: "flex",
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "flex-end",
    padding: 16,
  }
});

export default App;
