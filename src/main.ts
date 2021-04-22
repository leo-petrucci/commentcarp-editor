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
import "./assets/main.css";

const init = () => {
  // const body = document.body;
  // const editor =
  //   '    <div\r\n      defer-x-data="comment(`<p>This is a simple example using <code>tiptap</code> and <code>alpinejs</code>.</p>`)"\r\n      x-init="() => init($refs.element); checkLogin(); addListener()"\r\n    />\r\n    <div id="app" class="flex flex-col items-center">\r\n      <div class="max-w-lg w-full flex flex-col justify-end">\r\n        <!-- User\'s profile -->\r\n        <div id="commentcarp__user">\r\n          <template x-if="loggedIn">\r\n            <div class="flex items-center px-2 pt-2 justify-end">\r\n              <div\r\n                class="w-6 h-6 bg-cover rounded-full mr-2"\r\n                x-bind:style="`background-image: url(${ user.photo })`"\r\n              ></div>\r\n              <div class="font-bold" x-text="user.displayName"></div>\r\n              <div class="text-gray-500 flex">\r\n                @\r\n                <div x-text="user.username"></div>\r\n              </div>\r\n            </div>\r\n          </template>\r\n          <div x-show="!loggedIn">\r\n            <!-- some kind of message here? idk -->\r\n          </div>\r\n        </div>\r\n        <!-- User\'s Profile End -->\r\n\r\n        <div>\r\n          <template x-if="editor">\r\n            <div class="py-2">\r\n              <button\r\n                data-text="Bold"\r\n                class="commentcarp__button tooltip"\r\n                @click="editor.chain().toggleBold().focus().run()"\r\n                :class="{ \'is-active\': editor.isActive(\'bold\') }"\r\n              >\r\n                <svg viewBox="0 0 24 24" id="icon--bold" height="14" width="14">\r\n                  <path\r\n                    d="M17.194 10.962A6.271 6.271 0 0012.844.248H4.3a1.25 1.25 0 000 2.5h1.013a.25.25 0 01.25.25V21a.25.25 0 01-.25.25H4.3a1.25 1.25 0 100 2.5h9.963a6.742 6.742 0 002.93-12.786zm-4.35-8.214a3.762 3.762 0 010 7.523H8.313a.25.25 0 01-.25-.25V3a.25.25 0 01.25-.25zm1.42 18.5H8.313a.25.25 0 01-.25-.25v-7.977a.25.25 0 01.25-.25h5.951a4.239 4.239 0 010 8.477z"\r\n                  ></path>\r\n                </svg>\r\n              </button>\r\n\r\n              <button\r\n                data-text="Italic"\r\n                class="commentcarp__button tooltip"\r\n                @click="editor.chain().toggleItalic().focus().run()"\r\n                :class="{ \'is-active\': editor.isActive(\'italic\') }"\r\n              >\r\n                <svg viewBox="0 0 24 24" id="icon--italic">\r\n                  <path\r\n                    d="M22.5.248h-7.637a1.25 1.25 0 000 2.5h1.086a.25.25 0 01.211.384L4.78 21.017a.5.5 0 01-.422.231H1.5a1.25 1.25 0 000 2.5h7.637a1.25 1.25 0 000-2.5H8.051a.25.25 0 01-.211-.384L19.22 2.98a.5.5 0 01.422-.232H22.5a1.25 1.25 0 000-2.5z"\r\n                  ></path>\r\n                </svg>\r\n              </button>\r\n\r\n              <button\r\n                data-text="List"\r\n                class="commentcarp__button tooltip"\r\n                @click="editor.chain().focus().toggleBulletList().run()"\r\n                :class="{ \'is-active\': editor.isActive(\'bulletList\') }"\r\n              >\r\n                <svg viewBox="0 0 24 24" id="icon--ul">\r\n                  <circle cx="2.5" cy="3.998" r="2.5"></circle>\r\n                  <path d="M8.5 5H23a1 1 0 000-2H8.5a1 1 0 000 2z"></path>\r\n                  <circle cx="2.5" cy="11.998" r="2.5"></circle>\r\n                  <path d="M23 11H8.5a1 1 0 000 2H23a1 1 0 000-2z"></path>\r\n                  <circle cx="2.5" cy="19.998" r="2.5"></circle>\r\n                  <path d="M23 19H8.5a1 1 0 000 2H23a1 1 0 000-2z"></path>\r\n                </svg>\r\n              </button>\r\n\r\n              <button\r\n                data-text="Inline Code"\r\n                class="commentcarp__button tooltip"\r\n                @click="editor.chain().focus().toggleCode().run()"\r\n                :class="{ \'is-active\': editor.isActive(\'code\') }"\r\n              >\r\n                <svg viewBox="0 0 24 24" id="icon--code">\r\n                  <path\r\n                    d="M9.147 21.552a1.244 1.244 0 01-.895-.378L.84 13.561a2.257 2.257 0 010-3.125l7.412-7.613a1.25 1.25 0 011.791 1.744l-6.9 7.083a.5.5 0 000 .7l6.9 7.082a1.25 1.25 0 01-.9 2.122zm5.707 0a1.25 1.25 0 01-.9-2.122l6.9-7.083a.5.5 0 000-.7l-6.9-7.082a1.25 1.25 0 011.791-1.744l7.411 7.612a2.257 2.257 0 010 3.125l-7.412 7.614a1.244 1.244 0 01-.89.38zm6.514-9.373z"\r\n                  ></path>\r\n                </svg>\r\n              </button>\r\n\r\n              <button\r\n                data-text="Code Block"\r\n                class="commentcarp__button tooltip"\r\n                @click="editor.chain().focus().toggleCodeBlock().run()"\r\n                :class="{ \'is-active\': editor.isActive(\'codeBlock\') }"\r\n              >\r\n                <svg viewBox="0 0 24 24" id="icon--code">\r\n                  <path\r\n                    d="M9.147 21.552a1.244 1.244 0 01-.895-.378L.84 13.561a2.257 2.257 0 010-3.125l7.412-7.613a1.25 1.25 0 011.791 1.744l-6.9 7.083a.5.5 0 000 .7l6.9 7.082a1.25 1.25 0 01-.9 2.122zm5.707 0a1.25 1.25 0 01-.9-2.122l6.9-7.083a.5.5 0 000-.7l-6.9-7.082a1.25 1.25 0 011.791-1.744l7.411 7.612a2.257 2.257 0 010 3.125l-7.412 7.614a1.244 1.244 0 01-.89.38zm6.514-9.373z"\r\n                  ></path>\r\n                </svg>\r\n              </button>\r\n\r\n              <button\r\n                data-text="Quote"\r\n                class="commentcarp__button tooltip"\r\n                @click="editor.chain().focus().toggleBlockquote().run()"\r\n                :class="{ \'is-active\': editor.isActive(\'blockquote\') }"\r\n              >\r\n                <svg viewBox="0 0 24 24" id="icon--quote">\r\n                  <path\r\n                    d="M18.559 3.932a4.942 4.942 0 100 9.883 4.609 4.609 0 001.115-.141.25.25 0 01.276.368 6.83 6.83 0 01-5.878 3.523 1.25 1.25 0 000 2.5 9.71 9.71 0 009.428-9.95V8.873a4.947 4.947 0 00-4.941-4.941zm-12.323 0a4.942 4.942 0 000 9.883 4.6 4.6 0 001.115-.141.25.25 0 01.277.368 6.83 6.83 0 01-5.878 3.523 1.25 1.25 0 000 2.5 9.711 9.711 0 009.428-9.95V8.873a4.947 4.947 0 00-4.942-4.941z"\r\n                  ></path>\r\n                </svg>\r\n              </button>\r\n            </div>\r\n          </template>\r\n\r\n          <div\r\n            x-ref="element"\r\n            id="commentcarp__editor"\r\n            class="prose focus:outline-none"\r\n          ></div>\r\n        </div>\r\n        <a\r\n          class="text-xs text-gray-500 text-right pr-2 hover:underline cursor-pointer"\r\n        >\r\n          Safety first: Commentcarp won\'t save or share any of your private info\r\n          when you comment.\r\n        </a>\r\n        <div class="flex justify-end py-2">\r\n          <button\r\n            @click="post()"\r\n            :disabled="loading"\r\n            class="flex items-center px-4 py-2 text-sm font-semibold text-black border-2 border-black hover:border-gray-900 hover:bg-gray-50 disabled:opacity-50 rounded-full focus:outline-none transition-colors"\r\n          >\r\n            <div\r\n              x-show="loading"\r\n              x-transition:enter="transition ease-out duration-300"\r\n              x-transition:enter-start="opacity-0 transform scale-90"\r\n              x-transition:enter-end="opacity-100 transform scale-100"\r\n              x-transition:leave="transition ease-in duration-300"\r\n              x-transition:leave-start="opacity-100 transform scale-100"\r\n              x-transition:leave-end="opacity-0 transform scale-90"\r\n            >\r\n              <svg\r\n                class="animate-spin"\r\n                width="16"\r\n                height="16"\r\n                viewBox="0 0 24 24"\r\n                fill="none"\r\n                xmlns="http://www.w3.org/2000/svg"\r\n              >\r\n                <path\r\n                  opacity="0.2"\r\n                  fill-rule="evenodd"\r\n                  clip-rule="evenodd"\r\n                  d="M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"\r\n                  fill="currentColor"\r\n                />\r\n                <path\r\n                  d="M2 12C2 6.47715 6.47715 2 12 2V5C8.13401 5 5 8.13401 5 12H2Z"\r\n                  fill="currentColor"\r\n                />\r\n              </svg>\r\n            </div>\r\n\r\n            <div\r\n              x-bind:class="{ \'ml-2\': loading }"\r\n              x-show="loggedIn === true"\r\n              x-transition:enter="transition ease-out duration-300"\r\n              x-transition:enter-start="opacity-0 transform scale-90"\r\n              x-transition:enter-end="opacity-100 transform scale-100"\r\n              x-transition:leave="transition ease-in duration-300"\r\n              x-transition:leave-start="opacity-100 transform scale-100"\r\n              x-transition:leave-end="opacity-0 transform scale-90"\r\n            >\r\n              Post Comment\r\n            </div>\r\n            <div\r\n              x-bind:class="{ \'ml-2\': loading }"\r\n              x-show="loggedIn === false"\r\n              x-transition:enter="transition ease-out duration-300"\r\n              x-transition:enter-start="opacity-0 transform scale-90"\r\n              x-transition:enter-end="opacity-100 transform scale-100"\r\n              x-transition:leave="transition ease-in duration-300"\r\n              x-transition:leave-start="opacity-100 transform scale-100"\r\n              x-transition:leave-end="opacity-0 transform scale-90"\r\n            >\r\n              Login with Twitter\r\n            </div>\r\n          </button>\r\n        </div>\r\n      </div>\r\n    </div>';
  // body.insertAdjacentHTML("beforeend", editor);
  const comp = document.querySelector("[defer-x-data]")!;
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
          Placeholder,
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
