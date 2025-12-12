import { useCallback } from "react";

interface PreviewOptions {
  /** 默认内容（如果 content 为空） */
  defaultContent?: string;
}

/**
 * 模板预览 Hook
 * 在新窗口中预览 HTML 内容
 */
export function usePreview({
  defaultContent = "<p>暂无内容</p>",
}: PreviewOptions = {}) {
  const preview = useCallback(
    (content: string) => {
      const htmlContent = content || defaultContent;
      const newWindow = window.open("", "_blank");

      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      }
    },
    [defaultContent]
  );

  return preview;
}
