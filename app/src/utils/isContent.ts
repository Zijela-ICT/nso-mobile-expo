import {
  ContentItem,
  Downloadable,
  Infographic,
  InteractiveContent,
  Linkable,
  OrderedList,
  OrderedNestedListItem,
  Question,
  Quiz,
  Sidebar,
  Table,
  Text,
  UnorderedList,
  UnorderedNestedListItem,
  Video,
  Image,
  Heading,
} from '../../../types/book.types';

export default function isTextContent(obj: any): obj is Text {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.type === 'text' &&
    typeof obj.content === 'string'
  );
}

export function isLinkable(obj: any): obj is Linkable {
  if (
    !obj ||
    typeof obj !== 'object' ||
    obj.type !== 'linkable' ||
    !Array.isArray(obj.content)
  ) {
    return false;
  }

  for (const item of obj.content) {
    if (typeof item.text !== 'string') {
      return false;
    }
  }

  return true;
}

export function isUnorderedList(obj: any): obj is UnorderedList {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  if (
    'type' in obj &&
    obj.type === 'unorderedList' &&
    'items' in obj &&
    Array.isArray(obj.items)
  ) {
    for (const item of obj.items) {
      if (
        typeof item !== 'string' &&
        !isTextContent(item) &&
        !isLinkable(item) &&
        !isUnorderedNestedListItem(item)
      ) {
        return false;
      }
    }
  } else {
    return false;
  }

  return true;
}

export function isUnorderedNestedListItem(
  obj: any,
): obj is UnorderedNestedListItem {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  if ('content' in obj) {
    if (
      typeof obj.content !== 'string' &&
      !isTextContent(obj.content) &&
      !isLinkable(obj.content)
    ) {
      return false;
    }
  } else {
    return false;
  }

  if ('nestedItems' in obj) {
    if (!isUnorderedList(obj.nestedItems)) {
      return false;
    }
  }

  return true;
}

export function isOrderedList(obj: any): obj is OrderedList {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  if (
    'type' in obj &&
    obj.type === 'orderedList' &&
    'items' in obj &&
    Array.isArray(obj.items)
  ) {
    for (const item of obj.items) {
      if (
        typeof item !== 'string' &&
        !isTextContent(item) &&
        !isLinkable(item) &&
        !isOrderedNestedListItem(item)
      ) {
        return false;
      }
    }
  } else {
    return false;
  }

  return true;
}

export function isOrderedNestedListItem(
  obj: any,
): obj is OrderedNestedListItem {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  if (
    'content' in obj &&
    (typeof obj.content === 'string' ||
      isTextContent(obj.content) ||
      isLinkable(obj.content))
  ) {
    if ('nestedItems' in obj) {
      if (!isOrderedList(obj.nestedItems)) {
        return false;
      }
    }
  } else {
    return false;
  }

  return true;
}

export function isTable(obj: any): obj is Table {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  if (
    'type' in obj &&
    obj.type === 'table' &&
    'rows' in obj &&
    Array.isArray(obj.rows)
  ) {
    for (const row of obj.rows) {
      if (!Array.isArray(row)) {
        return false;
      }
      for (const cell of row) {
        if (!isValidTableCell(cell)) {
          return false;
        }
      }
    }
  } else {
    return false;
  }

  return true;
}

export function isImage(obj: any): obj is Image {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.type === 'image' &&
    typeof obj.src === 'string' &&
    typeof obj.alt === 'string'
  );
}

// Function to check if a cell is a valid TableCell
function isValidTableCell(cell: any): boolean {
  return (
    typeof cell === 'string' || // A cell can be a string
    isTextContent(cell) || // or a Text ContentItem
    isLinkable(cell) || // or a Linkable ContentItem
    isTable(cell) // or a nested Table
  );
}

export function isVideo(obj: any): obj is Video {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.type === 'video' &&
    typeof obj.src === 'string' &&
    typeof obj.alt === 'string'
  );
}

export function isQuiz(obj: any): obj is Quiz {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.type === 'quiz' &&
    typeof obj.question === 'string' &&
    Array.isArray(obj.options) &&
    obj.options.every((opt: any) => typeof opt === 'string') &&
    typeof obj.correctAnswer === 'string'
  );
}

export function isInfographic(obj: any): obj is Infographic {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.type === 'infographic' &&
    typeof obj.src === 'string' &&
    typeof obj.alt === 'string'
  );
}

export function isSidebar(obj: any): obj is Sidebar {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.type === 'sidebar' &&
    typeof obj.content === 'string'
  );
}

export function isInteractiveContent(obj: any): obj is InteractiveContent {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.type === 'interactiveContent' &&
    typeof obj.interactiveSrc === 'string' &&
    typeof obj.interactiveDescription === 'string'
  );
}

export function isQuestion(obj: any): obj is Question {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.type === 'question' &&
    typeof obj.question === 'string' &&
    typeof obj.answer === 'string'
  );
}

export function isDownloadable(obj: any): obj is Downloadable {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.type === 'downloadable' &&
    typeof obj.label === 'string' &&
    typeof obj.url === 'string' &&
    typeof obj.name === 'string'
  );
}

// Update isContentItem to include all types
export function isContentItem(obj: any): obj is ContentItem {
  return (
    obj &&
    typeof obj === 'object' &&
    (obj.type === 'space' ||
      obj.type === 'heading1' ||
      obj.type === 'heading2' ||
      obj.type === 'heading3' ||
      obj.type === 'text' ||
      obj.type === 'unorderedList' ||
      obj.type === 'orderedList' ||
      obj.type === 'table' ||
      obj.type === 'video' ||
      obj.type === 'quiz' ||
      obj.type === 'infographic' ||
      obj.type === 'sidebar' ||
      obj.type === 'interactiveContent' ||
      obj.type === 'question' ||
      obj.type === 'downloadable' ||
      obj.type === 'image') // Added image type here
  );
}

export function isHeading(obj: any): obj is Heading {
  return (
    obj &&
    typeof obj === 'object' &&
    (obj.type === 'heading1' ||
      obj.type === 'heading2' ||
      obj.type === 'heading3') &&
    typeof obj.content === 'string'
  );
}
