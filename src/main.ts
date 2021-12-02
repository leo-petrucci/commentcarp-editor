// @ts-ignore
import Alpine from "alpinejs";
// @ts-ignore
import html from "html-template-string";
import { Content, Editor } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Code from "@tiptap/extension-code";
import Mention from "@tiptap/extension-mention";
import CodeBlock from "@tiptap/extension-code-block";
import Blockquote from "@tiptap/extension-blockquote";
import Placeholder from "@tiptap/extension-placeholder";
// @ts-ignore
import styles from "./assets/main.css";
import tippy from "tippy.js";
import { SuggestionProps } from "@tiptap/suggestion";
import {
  auth,
  CommentsInterface,
  ConvertedUserInterface,
  fetchCommenters,
  fetchComments,
  send,
} from "./data/data";

const script = document.querySelector('script[data-name="commentcarp"]');

// @ts-ignore
export const key = script?.attributes["data-key"].nodeValue;

const init = async () => {
  const shadowDom = await fetch(
    // @ts-ignore
    `${import.meta.env.VITE_APP_URL}/template.html`
  ).then((res) => res.text());
  const commentcarpRoot = document.getElementById("commentcarp")!;
  if (commentcarpRoot) {
    commentcarpRoot.innerHTML = "";

    const style = document.createElement("style");
    style.textContent = styles;

    const template = document.createElement("template");
    template.innerHTML = shadowDom.trim();
    commentcarpRoot.appendChild(template.content!);
    const comp = commentcarpRoot.querySelector("[defer-x-data]")!;
    comp.setAttribute("x-data", comp.getAttribute("defer-x-data")!);
    Alpine.initializeComponent(comp);
  }
};

// @ts-ignore
window.commentcarp = init;

// @ts-ignore
script!.onload = () => {
  init();
};

window.addEventListener("initCommentCarp", init);

declare global {
  interface Window {
    comment: (content: Content) => {
      editor: Editor | null;
      loading: boolean;
      loggedIn?: boolean;
      user: ConvertedUserInterface | null;
      comments: {
        isError: boolean;
        isLoading: boolean;
        list: CommentsInterface[];
      };
      getComments: () => Promise<unknown>;
      init: (element: Element) => void;
      post: () => void;
      checkLogin: () => void;
    };
  }
}

export const endpoint = import.meta.env.VITE_API_URL;

const comment = (content: Content = "") => {
  return {
    loading: true,
    loggedIn: undefined,
    user: null,

    editor: null as null | Editor,
    content: content,
    errorMessage: "",

    comments: {
      isLoading: true,
      isError: false,
      list: [],
    },

    async init(element: Element) {
      const { getAllCommenters } = await fetchCommenters();

      this.editor = new Editor({
        element: element,
        extensions: [
          Document,
          Paragraph,
          Text,
          Bold,
          Italic,
          BulletList,
          ListItem,
          Code,
          CodeBlock,
          Blockquote,
          Placeholder.configure({ placeholder: "Write a comment!" }),
          Mention.configure({
            HTMLAttributes: {
              class: "mention",
            },
            suggestion: {
              items: (query) => {
                return getAllCommenters
                  .map(({ username }) => username)
                  .filter((item) =>
                    item.toLowerCase().startsWith(query.toLowerCase())
                  )
                  .slice(0, 5);
              },
              render: () => {
                let popup: any;

                const selectItem = (props: SuggestionProps, item: any) => {
                  if (item) {
                    props.command({ id: item, mention: "idk" });
                  }
                };

                const menu = (props: SuggestionProps) => {
                  const div = document.createElement("div");
                  const items = document.createElement("div");
                  items.className = "items";

                  props.items.forEach((suggestion) => {
                    const button = document.createElement("button");
                    button.innerText = suggestion;
                    button.className = "item";
                    button.addEventListener("click", function () {
                      selectItem(props, suggestion);
                    });
                    items.appendChild(button);
                  });

                  div.appendChild(items);
                  return div.firstChild;
                };
                return {
                  onStart: (props) => {
                    // @ts-ignore
                    popup = tippy("body", {
                      getReferenceClientRect: props.clientRect,
                      appendTo: () =>
                        document.getElementById("commentcarp") as Element,
                      content: menu(props),
                      showOnCreate: true,
                      interactive: true,
                      allowHTML: true,
                      trigger: "manual",
                      placement: "bottom-start",
                    });

                    console.log(popup[0]);
                  },
                  onUpdate(props) {
                    popup[0].setProps({
                      getReferenceClientRect: props.clientRect,
                      content: menu(props),
                    });
                  },
                  onKeyDown() {
                    return false;
                  },
                  onExit() {
                    popup[0].destroy();
                  },
                };
              },
            },
          }),
        ],
        content: this.content,
        onUpdate: ({ editor }) => {
          this.content = editor.getHTML();
        },
      });
    },
    addListener() {
      window.addEventListener(
        "message",
        (event) => {
          if (event.origin === endpoint) {
            const cookie = `token=${window.escape(
              event.data
            )}; Max-Age=604800;`;
            document.cookie = cookie;
            this.checkLogin();
          }
        },
        false
      );
    },
    async getComments() {
      try {
        const { getAllComments } = await fetchComments();
        // @ts-ignore
        this.comments.isLoading = false;
        // @ts-ignore
        this.comments.list = getAllComments;
        // @ts-ignore
      } catch (err) {
        // @ts-ignore
        this.comments.isLoading = false;
      }
    },
    getLink(user: ConvertedUserInterface) {
      switch (user.provider) {
        case "twitter":
          return `https://twitter.com/i/user/${user.platformId}`;
      }
    },
    async checkLogin() {
      const user = await auth();
      if (user.getMyCommenterProfile) {
        // @ts-ignore
        this.user = user.getMyCommenterProfile;
        this.loading = false;
        // @ts-ignore
        this.loggedIn = true;
      } else {
        this.loading = false;
        // @ts-ignore
        this.loggedIn = false;
      }
    },
    async post() {
      if (this.loggedIn) {
        this.loading = true;
        try {
          await send(this.content as string);
          this.loading = false;
          await this.getComments();
          this.editor?.commands.clearContent();
          this.content = "";
        } catch (err: any) {
          this.loading = false;
          this.errorMessage = err.toString().replace("Error:", "");
          throw new Error(err);
        }
      } else {
        this.login();
      }
    },
    login() {
      const w = 450;
      const h = 450;
      const dualScreenLeft =
        window.screenLeft !== undefined ? window.screenLeft : window.screenX;
      const dualScreenTop =
        window.screenTop !== undefined ? window.screenTop : window.screenY;

      const width = window.innerWidth
        ? window.innerWidth
        : document.documentElement.clientWidth
        ? document.documentElement.clientWidth
        : screen.width;
      const height = window.innerHeight
        ? window.innerHeight
        : document.documentElement.clientHeight
        ? document.documentElement.clientHeight
        : screen.height;

      const systemZoom = width / window.screen.availWidth;
      const left = (width - w) / 2 / systemZoom + dualScreenLeft;
      const top = (height - h) / 2 / systemZoom + dualScreenTop;
      window.open(
        `${endpoint}/api/oauth/`,
        "Twitter Login",
        `
        height=${h},
        width=${w}, 
        top=${top}, 
        left=${left}
      `
      );
    },
  };
};

window.comment = comment;
