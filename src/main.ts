// @ts-ignore
import Alpine from "alpinejs";
import { Content, Editor } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import Blockquote from "@tiptap/extension-blockquote";
import Placeholder from "@tiptap/extension-placeholder";
// @ts-ignore
import styles from "./assets/main.css";

console.log(process.env.VERCEL_ENV);

const init = async () => {
  const shadowDom = await fetch(
    `${
      process.env.VERCEL_ENV === "production"
        ? "https://commentcarp-editor.vercel.app"
        : "http://localhost:3000"
    }/template.html`
  ).then((res) => res.text());
  const commentcarpRoot = document.getElementById("commentcarp")!;
  // const commentcarpShadow = commentcarpRoot.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = styles;
  document.head.append(style);

  const template = document.createElement("template");
  template.innerHTML = shadowDom.trim();
  // const parsedDom = new DOMParser().parseFromString(shadowDom, "text/html");
  commentcarpRoot.appendChild(template.content!);
  const comp = commentcarpRoot.querySelector("[defer-x-data]")!;
  comp.setAttribute("x-data", comp.getAttribute("defer-x-data")!);
  Alpine.initializeComponent(comp);
};

init();

declare global {
  interface Window {
    comment: (
      content: Content
    ) => {
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

const endpoint = "https://commentcarp.vercel.app";

const comment = (content: Content) => {
  return {
    loading: true,
    loggedIn: undefined,
    user: null,

    editor: null,
    content: content,

    comments: {
      isLoading: true,
      isError: false,
      list: [],
    },

    init(element: Element) {
      // @ts-ignore
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
          Placeholder.configure({ placeholder: "" }),
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
            const cookie = `socialAccesstoken=${window.escape(event.data)}`;
            document.cookie = cookie;
            this.checkLogin();
          }
        },
        false
      );
    },
    async getComments() {
      try {
        const { comments } = await fetchComments();
        // @ts-ignore
        this.comments.isLoading = false;
        // @ts-ignore
        this.comments.list = comments;
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
      try {
        const user = await auth();
        // @ts-ignore
        this.user = user.socialInfo;
        this.loading = false;
        // @ts-ignore
        this.loggedIn = true;
      } catch (err) {
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
          // @ts-ignore
          this.editor.commands.clearContent();
        } catch (err) {
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
        `${endpoint}/api/auth/twitter/`,
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

export interface ConvertedUserInterface {
  id: string;
  username: string;
  displayName: string;
  verified?: boolean;
  url: string;
  photo: string;
  provider: "twitter";
  platformId: string;
}

const auth = async (): Promise<{ socialInfo: ConvertedUserInterface }> => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const body = JSON.stringify({
    query:
      "query {\r\n    socialInfo {\r\n        username\r\n        displayName\r\n        url\r\n        photo\r\n    }\r\n}",
    variables: {},
  });
  try {
    return (await handleGraphQL({ headers, body })) as {
      socialInfo: ConvertedUserInterface;
    };
  } catch (err) {
    throw new Error(err);
  }
};

interface CommentsInterface {
  id: string;
  origin: string;
  platformId: string;
  provider: string;
  profileUrl: string;
  username: string;
  displayName: string;
  photo: string;
  body: string;
}

const fetchComments = async (): Promise<{ comments: CommentsInterface[] }> => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const body = JSON.stringify({
    query:
      "query ($origin: String!) {\r\n    comments (origin: $origin) {\r\n        id\r\n        origin\r\n        platformId\r\n        provider\r\n        profileUrl\r\n        displayName\r\n        username\r\n        photo\r\n        body\r\n    }\r\n}",
    variables: { origin: window.location.href },
  });
  try {
    return (await handleGraphQL({ headers, body })) as {
      comments: CommentsInterface[];
    };
  } catch (err) {
    throw new Error(err);
  }
};

export interface CommentResponseInterface {
  origin: string;
  platformId: string;
  provider: "twitter";
  profileUrl: string;
  username: string;
  displayName: string;
  photo: string;
  body: string;
}

const send = async (
  comment: string
): Promise<{ comment: CommentResponseInterface }> => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const body = JSON.stringify({
    query:
      "mutation ($body: String!, $origin: String!) {\r\n    addComment (body: $body, origin: $origin) {\r\n        body\r\n        origin\r\n        username\r\n    }\r\n}",
    variables: { origin: window.location.href, body: comment },
  });

  try {
    return (await handleGraphQL({ headers, body })) as {
      comment: CommentResponseInterface;
    };
  } catch (err) {
    throw new Error(err);
  }
};

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift()!;
  return null;
}

const handleGraphQL = async ({
  headers,
  body,
}: {
  headers: Headers;
  body: string;
}): Promise<unknown> => {
  let parsedHeaders = headers;

  parsedHeaders.append(
    "Authorization",
    `Bearer ${getCookie("socialAccesstoken")}`
  );

  const result = await fetch(`${endpoint!}/api`, {
    method: "POST",
    headers: parsedHeaders,
    body,
    redirect: "follow",
    credentials: "include",
  }).then((response) => response.json());

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
};
