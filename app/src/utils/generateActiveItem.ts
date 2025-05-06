const generateActiveItem = ({
  chapterId,
  subChapterId,
  pageId,
}: {
  chapterId: number;
  subChapterId?: number;
  pageId?: number;
}) => {
  return `${chapterId}-${
    subChapterId !== undefined ? subChapterId : 'undefined'
  }-${pageId !== undefined ? pageId : 'undefined'}`;
};

export default generateActiveItem