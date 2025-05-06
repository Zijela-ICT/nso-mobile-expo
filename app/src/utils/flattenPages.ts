import { Chapter, FlattenedPage, Page } from "../../../types/book.types";

const flattenPages = (chapters: Chapter[]): FlattenedPage[] => {
  const pages: FlattenedPage[] = [];

  chapters?.forEach((chapter) => {
    if (!chapter) return; // Safeguard for null/undefined chapters

    // Add chapter-level pages
    chapter.pages?.forEach((page) => {
      if (!page || !page.items || page.items.length === 0) return; // Skip invalid or empty pages
      pages.push({
        content: page.items,
        chapterTitle: chapter.chapter,
      });
    });

    chapter.subChapters?.forEach((subChapter) => {
      if (!subChapter) return; // Safeguard for null/undefined subChapters

      // Add sub-chapter-level pages
      subChapter.pages?.forEach((page) => {
        
        if (!page || !page.items || page.items.length === 0) return; // Skip invalid or empty pages
        pages.push({
          content: page.items,
          chapterTitle: chapter.chapter,
          subChapterTitle: subChapter.subChapterTitle,
        });
      });

      subChapter.subSubChapters?.forEach((subSubChapter) => {
        if (!subSubChapter) return; // Safeguard for null/undefined subSubChapters

        // Add sub-sub-chapter-level pages
        subSubChapter.pages?.forEach((page) => {
          if (!page || !page.items || page.items.length === 0) return; // Skip invalid or empty pages
          pages.push({
            content: page.items,
            chapterTitle: chapter.chapter,
            subChapterTitle: subChapter.subChapterTitle,
            subSubChapterTitle: subSubChapter.subSubChapterTitle,
          });
        });
      });
    });
  });

  return pages;
};

export default flattenPages;