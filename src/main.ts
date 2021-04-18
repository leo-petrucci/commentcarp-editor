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
      loggedIn?: boolean;
      user: ConvertedUserInterface | null;
      init: () => void;
      post: () => void;
    };
  }
}

export interface ConvertedUserInterface {
  id: string;
  username: string;
  displayName: string;
  verified?: boolean;
  url: string;
  photo: string;
  provider: "twitter";
}

const endpoint = "http://localhost:3000/api";

const comment = () => {
  return {
    loading: true,
    loggedIn: undefined,
    user: null,
    addListener() {
      window.addEventListener(
        "message",
        (event) => {
          if (event.data === "login-success") {
            console.log("login was successful, reloading");
            this.init();
          }
        },
        false
      );
    },
    async init() {
      try {
        const user = await auth();
        console.log("user is logged in:", user);
        // @ts-ignore
        this.user = user;
        this.loading = false;
        // @ts-ignore
        this.loggedIn = true;
      } catch (err) {
        this.loading = false;
        // @ts-ignore
        this.loggedIn = false;
      }
    },
    post() {
      if (this.loggedIn) {
        this.loading = true;
        const turndownService = new TurndownService({
          codeBlockStyle: "fenced",
        });
        const comment = document.querySelector("#commentcarp__editor")
          ?.firstChild as Node;
        console.log(comment);
        const markdown = turndownService.turndown(comment);

        console.log(markdown);
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
        "http://localhost:3000/api/auth/twitter/",
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

const auth = async (): Promise<ConvertedUserInterface> => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const body = JSON.stringify({
    query: "query {\r\n    socialInfo {\r\n        username\r\n    }\r\n}",
    variables: {},
  });
  try {
    return (await handleGraphQL({ headers, body })) as ConvertedUserInterface;
  } catch (err) {
    throw new Error(err);
  }
};

const handleGraphQL = async ({
  headers,
  body,
}: {
  headers: Headers;
  body: string;
}): Promise<unknown> => {
  const result = await fetch(endpoint, {
    method: "POST",
    headers,
    body,
    credentials: "include",
  }).then((response) => response.json());

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
};

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
