import Paragraph from "@tiptap/extension-paragraph";
import {
  BLANK_LINE_MARKER,
  isBlankLineParagraph,
} from "@/lib/markdown-blank-lines";

export const PreserveBlankLinesParagraph = Paragraph.extend({
  addStorage() {
    return {
      markdown: {
        serialize(
          state: {
            write: (text: string) => void;
            closeBlock: (node: unknown) => void;
            renderInline: (node: unknown) => void;
          },
          node: Parameters<typeof isBlankLineParagraph>[0],
        ) {
          if (isBlankLineParagraph(node)) {
            state.write(BLANK_LINE_MARKER);
            state.closeBlock(node);
            return;
          }

          state.renderInline(node);
          state.closeBlock(node);
        },
        parse: {
          updateDOM(element: HTMLElement) {
            element.querySelectorAll("p").forEach((paragraph) => {
              if (paragraph.textContent === BLANK_LINE_MARKER) {
                paragraph.textContent = "";
              }
            });
          },
        },
      },
    };
  },
});
