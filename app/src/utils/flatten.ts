import { Chapter, Page } from "../../../types/book.types";

export interface FlattenedPage extends Page {
  chapter: string;
  chapterIndex: number;
  subChapterTitle?: string;
  subChapterIndex: number | undefined;
  pageIndex: number;
  marker: number;
}

export function flatten(chapters: Chapter[]) {
  let flattenedPages: FlattenedPage[] = [];
  let marker = 0;
  chapters.forEach((chapter, chapterIndex) => {
    chapter.pages?.forEach((page, pageIndex) => {
      flattenedPages.push({
        ...page,
        chapter: chapter.chapter,
        chapterIndex,
        subChapterIndex: undefined,
        pageIndex,
        marker: marker++
      });
    });

    if (chapter.subChapters) {
      chapter.subChapters.forEach((subChapter, subChapterIndex) => {
        // flatten([subChapter], chapter.chapter, subChapter.subChapterTitle);
        subChapter.pages.forEach((page, pageIndex) => {
          flattenedPages.push({
            ...page,
            chapter: chapter.chapter,
            chapterIndex,
            subChapterTitle: subChapter.subChapterTitle,
            subChapterIndex,
            pageIndex,
            marker: marker++
          });
        });
      });
    }
  });

  return flattenedPages;
}
