/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Book {
  subTitle: string;
  bookTitle: string;
  heading: string;
  coverUrl: string;
  content: Chapter[];
  cpd_enabled: boolean;
  content_keystrokes_threshold: number;
  topbar_search_threshold: number;
  cpd_minimum_threshold: number;
  learning_hours_threshold: number;
  points_multiplier_increment: number;
  courseName: string;
  trainingProvider: string;
  utils?: {
    [key: string]: any;
  };
  pointsConfig: {
    [key: string]: number;
    video_watched: number;
    top_search_made: number;
    content_search_made: number;
    refresh_made: number;
    page_visited: number;
    download_made: number;
    image_clicked: number;
    quizMultiplier: number;
    retriesMultiplier: number;
  };
}

export interface Chapter {
  chapter: string;
  pages?: Page[];
  subChapters?: SubChapter[];
}

export interface SubChapter {
  subChapterTitle: string;
  pages?: Page[];
  subSubChapters?: SubSubChapter[];
}

export interface SubSubChapter {
  subSubChapterTitle: string;
  pages?: Page[];
}

export interface Page {
  pageTitle?: string;
  items: ContentItem[];
  markVisit?: boolean;
}

// Define the base properties for ContentItem
interface BaseContentItem {
  onlyBook?: boolean; // Optional: Show only in the book renderer
  onlyDecisionMaker?: boolean; // Optional: Show only in the decision maker app
}

// Define a utility type to merge BaseContentItem with other types
export type WithBase<T> = T & BaseContentItem;

export type ContentItem =
  | WithBase<Space>
  | WithBase<Heading>
  | WithBase<Text>
  | WithBase<BookImage>
  | WithBase<UnorderedList>
  | WithBase<OrderedList>
  | WithBase<Video>
  | WithBase<Table>
  | WithBase<Quiz>
  | WithBase<horizontalLine>
  | WithBase<Infographic>
  | WithBase<Sidebar>
  | WithBase<InteractiveContent>
  | WithBase<Question>
  | WithBase<Linkable>
  | WithBase<Downloadable>
  | WithBase<Decision>;

export interface Decision {
  type: 'decision';
  name: string;
  history: string[];
  examinationsActions: string[];
  findingsOnExamination: string[]; // List of findings on examination
  cases: DecisionCase[]; // Array of cases
  healthEducation: string[];
}

export interface DecisionCase {
  findingsOnHistory: string;
  findingsOnExamination: string[]; // Related findings on examination
  clinicalJudgement: string[]; // Clinical judgement for the case
  actions: string[]; // Steps or actions to take
  healthEducation: string[];
  decisionScore: number;
  decisionDependencies: string[];
}

export interface Space {
  type: 'space';
  content?: string;
}

export interface Linkable {
  type: 'linkable';
  content: {
    text: string;
    linkTo?: string;
    linkType: 'internal' | 'external';
    textStyle?: object;
  }[];
  style?: object;
}

export interface Heading {
  type: 'heading1' | 'heading2' | 'heading3';
  content: string;
}

export interface Text {
  type: 'text';
  content: string;
  style?: object;
}

export interface BookImage {
  type: 'image';
  src: string;
  alt: string;
  translate?: boolean;
}

export interface UnorderedList {
  type: 'unorderedList';
  items: (string | Text | Linkable | UnorderedNestedListItem)[];
}

export interface UnorderedNestedListItem {
  content: string | Text | Linkable;
  nestedItems?: UnorderedList;
}

export interface OrderedList {
  type: 'orderedList';
  items: (string | Text | Linkable | OrderedNestedListItem)[];
}

export interface OrderedNestedListItem {
  content: string | Text | Linkable;
  nestedItems?: OrderedList;
}

export interface Video {
  type: 'video';
  src: string;
  title: string; // Optional properties if needed
  fileName: string;
  description?: string; // Optional properties if needed
  openExternal?: boolean;
  translate?: boolean;
  youtube?: boolean;
}

// Modify the Table interface to allow rows to contain either strings or TableCell objects
export interface Table {
  type: 'table';
  title?: string;
  headers?: ({
    rowSpan?: number;
    colSpan?: number;
    cellStyle?: object;
  } & ContentItem)[][];
  rows: ({
    rowSpan?: number;
    colSpan?: number;
    cellStyle?: object;
  } & ContentItem)[][]; // Rows can now contain either strings or TableCell objects
  showCellBorders?: boolean;
  tableStyle?: object;
  headless?: boolean;
  itemsPerPage?: number;
  columnCount?: number;
}

export interface Quiz {
  type: 'quiz';
  title: string;
  sectionId: string;
  duration: number;
  retries: number;
  questions: {
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
}

export interface horizontalLine {
  type: 'horizontalLine';
  style?: object;
}

export interface Infographic {
  type: 'infographic';
  src: string;
  height?: number;
  width?: number;
  alt: string;
  translate?: boolean;
}

export interface Sidebar {
  type: 'sidebar';
  content: string;
}

export interface InteractiveContent {
  type: 'interactiveContent';
  interactiveSrc: string;
  interactiveDescription: string;
  style?: object; // Optional custom style for the cell
}

export interface Question {
  type: 'question';
  question: string;
  answer: string;
  style?: object;
}

export interface Downloadable {
  type: 'downloadable';
  label: string;
  url: string;
  name: string;
  fileName: string;
  style?: object; // Optional custom style for the cell
}

export interface FlattenedPage {
  content: ContentItem[];
  chapterTitle: string;
  subChapterTitle?: string;
  subSubChapterTitle?: string;
}