import "alpinejs";
import TurndownService, { Node } from "turndown";
import { Content, Editor } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import Blockquote from "@tiptap/extension-blockquote";
import "./assets/main.css";

declare global {
  interface Window {
    postComment: () => void;
    setupEditor: (
      content: Content
    ) => {
      editor: null;
      content: Content;
      init(element: Element): void;
    };
    comment: () => {
      loading: boolean;
      post: () => void;
    };
  }
}

const comment = () => ({
  loading: false,
  post() {
    this.loading = true;
    const turndownService = new TurndownService({ codeBlockStyle: "fenced" });
    const comment = document.querySelector("#commentcarp__editor")
      ?.firstChild as Node;
    console.log(comment);
    const markdown = turndownService.turndown(comment);

    console.log(markdown);
  },
});

window.comment = comment;

const setupEditor = (content: Content) => {
  return {
    editor: null,
    content: content,
    init(element: Element) {
      // @ts-ignore
      this.editor = new Editor({
        element: element,
        extensions: [
          Document,
          Paragraph,
          Text,
          Bold,
          BulletList,
          ListItem,
          Code,
          CodeBlock,
          Blockquote,
        ],
        content: this.content,
        onUpdate: ({ editor }) => {
          this.content = editor.getHTML();
        },
      });
    },
  };
};

window.setupEditor = setupEditor;

const postComment = () => {
  console.log(window);
  // this.loading = true;
  const turndownService = new TurndownService({ codeBlockStyle: "fenced" });
  const comment = document.querySelector("#commentcarp__editor")
    ?.firstChild as Node;
  console.log(comment);
  const markdown = turndownService.turndown(comment);

  console.log(markdown);
};

window.postComment = postComment;
