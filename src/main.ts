// @ts-ignore
import Alpine from "alpinejs";
// @ts-ignore
import html from "html-template-string";
// @ts-ignore
import { Content, Editor } from "@tiptap/core";
// @ts-ignore
import Document from "@tiptap/extension-document";
// @ts-ignore
import Paragraph from "@tiptap/extension-paragraph";
// @ts-ignore
import BulletList from "@tiptap/extension-bullet-list";
// @ts-ignore
import ListItem from "@tiptap/extension-list-item";
// @ts-ignore
import Text from "@tiptap/extension-text";
// @ts-ignore
import Bold from "@tiptap/extension-bold";
// @ts-ignore
import Italic from "@tiptap/extension-italic";
// @ts-ignore
import Code from "@tiptap/extension-code";
// @ts-ignore
import Mention from "@tiptap/extension-mention";
// @ts-ignore
import CodeBlock from "@tiptap/extension-code-block";
// @ts-ignore
import Blockquote from "@tiptap/extension-blockquote";
// @ts-ignore
import Placeholder from "@tiptap/extension-placeholder";
// @ts-ignore
import styles from "./assets/main.css";
// @ts-ignore
import tippy from "tippy.js";
// @ts-ignoree
import { SuggestionProps } from "@tiptap/suggestion";

const script = document.querySelector('script[data-name="commentcarp"]');

// @ts-ignore
const key = script?.attributes["data-key"].nodeValue;

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
    document.head.append(style);

    const template = document.createElement("template");
    template.innerHTML = shadowDom.trim();
    commentcarpRoot.appendChild(template.content!);
    const comp = commentcarpRoot.querySelector("[defer-x-data]")!;
    comp.setAttribute("x-data", comp.getAttribute("defer-x-data")!);

    Alpine.start();
  }
};

init();

window.addEventListener("initCommentCarp", function () {
  init();
});

// declare global {
//   interface Window {
//     comment: (content: Content) => {
//       editor: Editor | null;
//       loading: boolean;
//       loggedIn?: boolean;
//       user: ConvertedUserInterface | null;
//       comments: {
//         isError: boolean;
//         isLoading: boolean;
//         list: CommentsInterface[];
//       };
//       getComments: () => Promise<unknown>;
//       init: (element: Element) => void;
//       post: () => void;
//       checkLogin: () => void;
//     };
//   }
// }

const endpoint = import.meta.env.VITE_API_URL;

document.addEventListener("alpine:init", () => {
  Alpine.data("comment", () => comment);
});

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

interface ConvertedUserInterface extends CommenterInterface {
  verified?: boolean;
}

// @ts-ignore
const auth = async (): Promise<{
  getMyCommenterProfile?: ConvertedUserInterface;
}> => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const body = JSON.stringify({
    query:
      "query {\r\n    getMyCommenterProfile {\r\n        username\r\n        displayName\r\n        photo\r\n    }\r\n}",
    variables: {},
  });
  try {
    return (await handleGraphQL({
      headers,
      body,
      identifier: "?getMyCommenterProfile",
    })) as {
      getMyCommenterProfile: ConvertedUserInterface;
    };
  } catch (err) {
    return {};
  }
};

interface CommentsInterface {
  id: string;
  origin: string;
  commenter: CommenterInterface;
  body: string;
}

// @ts-ignore
const fetchComments = async (): Promise<{
  getAllComments: CommentsInterface[];
}> => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const body = JSON.stringify({
    query:
      "query ($origin: String!, $key: String!) {\r\n    getAllComments (origin: $origin, key: $key) {\r\n        id\r\n        origin\r\n        commenter\r\n        { platformId\r\n        provider\r\n        displayName\r\n        username\r\n        photo\r\n }       body\r\n    }\r\n}",
    variables: { origin: window.location.href, key },
  });
  try {
    return (await handleGraphQL({
      headers,
      body,
      identifier: "?getAllComments",
    })) as {
      getAllComments: CommentsInterface[];
    };
  } catch (err) {
    console.error(err);
    return { getAllComments: [] };
  }
};

interface CommentResponseInterface {
  origin: string;
  commenter: CommenterInterface;
  body: string;
}

// @ts-ignore
const send = async (
  comment: string
): Promise<{ comment?: CommentResponseInterface }> => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const body = JSON.stringify({
    query:
      "mutation ($body: String!, $origin: String!, $key: String!) {\r\n    addOneComment (body: $body, origin: $origin, key: $key) {\r\n        body\r\n        origin\r\n                commenter\r\n        { username\r\n }    }\r\n}",
    variables: { origin: window.location.href, body: comment, key },
  });

  try {
    return (await handleGraphQL({
      headers,
      body,
      identifier: "?addOneComment",
    })) as {
      comment: CommentResponseInterface;
    };
  } catch (err) {
    console.error(err);
    return {};
  }
};

interface CommenterInterface {
  platformId: string;
  provider: "twitter";
  username: string;
  displayName: string;
  photo: string;
}

// @ts-ignore
const fetchCommenters = async (): Promise<{
  getAllCommenters: CommenterInterface[];
}> => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const body = JSON.stringify({
    query: `
      query ($origin: String!, $key: String!) {
        getAllCommenters(origin: $origin, key: $key) {
          platformId
          provider
          displayName
          username
          photo
        }
      }
    `,
    variables: { origin: window.location.href, key },
  });
  try {
    return (await handleGraphQL({
      headers,
      body,
      identifier: "?getAllCommenters",
    })) as {
      getAllCommenters: CommenterInterface[];
    };
  } catch (err) {
    console.error(err);
    return { getAllCommenters: [] };
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
  identifier,
}: {
  headers: Headers;
  body: string;
  identifier?: string;
}): Promise<unknown> => {
  let parsedHeaders = headers;

  parsedHeaders.append("Authorization", `Bearer ${getCookie("token")}`);

  const result = await fetch(`${endpoint!}/api${identifier || ""}`, {
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
