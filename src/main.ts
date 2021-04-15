import "alpinejs";
import TurndownService, { Node } from "turndown";
import "./editor/Editor";
import "./assets/main.css";

declare global {
  interface Window {
    postComment: () => void;
  }
}

const postComment = () => {
  const turndownService = new TurndownService();
  const comment = document.querySelector('div[data-type="editor"]')?.firstChild
    ?.lastChild as Node;
  console.log(comment);
  const markdown = turndownService.turndown(comment);

  console.log(markdown);
};

window.postComment = postComment;
