import Alpine from 'alpinejs';
// @ts-ignore
import html from 'html-template-string';
import { Content, Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Blockquote from '@tiptap/extension-blockquote';
import Placeholder from '@tiptap/extension-placeholder';
import styles from './assets/main.css';
import tippy from 'tippy.js';
import { SuggestionProps } from '@tiptap/suggestion';
import {
  auth,
  CommentsInterface,
  ConvertedUserInterface,
  fetchCommenters,
  fetchComments,
  send,
} from './data/data';
import { CustomMention } from './data/customMention';

const script = document.querySelector('script[data-name="commentcarp"]');

// @ts-ignore
export const key = script?.attributes['data-key'].nodeValue;

const init = async () => {
  const shadowDom = await fetch(
    // @ts-ignore
    `${import.meta.env.VITE_APP_URL}/template.html`
  ).then(res => res.text());
  const commentcarpRoot = document.getElementById('commentcarp')!;

  if (commentcarpRoot) {
    commentcarpRoot.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = styles;

    // If we're developing the styles are appended automatically by vite
    if (process.env.NODE_ENV === 'production') document.head.append(style);

    const template = document.createElement('template');
    template.innerHTML = shadowDom.trim();
    commentcarpRoot.appendChild(template.content!);
    Alpine.initTree(commentcarpRoot);
  }
};

if (script)
  //@ts-ignore
  script.onload = () => {
    init();
  };

// @ts-ignore
window.commentcarpeditor = init;

window.addEventListener('initCommentCarp', init);

declare global {
  interface Window {
    comment: (content: Content) => Commentcarp;
    editor: Editor | null;
    tippy: typeof tippy;
  }
}

interface Commentcarp {
  editor: () => Editor | null;
  content: Content;
  editorLoaded: boolean;
  loading: boolean;
  loggedIn?: boolean;
  errorMessage?: string;
  addListener: () => any;
  login: () => void;
  user: ConvertedUserInterface | null;
  comments: {
    isError: boolean;
    isLoading: boolean;
    list: CommentsInterface[];
  };
  getLink: (user: ConvertedUserInterface) => string;
  getComments: () => Promise<unknown>;
  initEditor: (element: Element) => void;
  post: () => void;
  checkLogin: () => void;
  buttons: any[];
  isButtonDisabled: () => boolean;
  reply: (comment: {
    userId: string;
    username: string;
    replyto: string;
  }) => void;
}

export const endpoint = import.meta.env.VITE_API_URL;

window.editor = null;
window.tippy = tippy;

const comment = (content: Content = ''): Commentcarp => {
  return {
    loading: true,
    loggedIn: undefined,
    user: {
      id: '',
      platformId: '',
      provider: 'twitter',
      photo: '',
      displayName: '',
      username: '',
    },

    editorLoaded: false,
    content: content,
    errorMessage: '',

    comments: {
      isLoading: true,
      isError: false,
      list: [] as CommentsInterface[],
    },
    async initEditor(element: Element) {
      this.checkLogin();
      this.addListener();
      this.getComments();
      const { getAllCommenters } = await fetchCommenters();

      window.editor?.destroy();

      window.editor = new Editor({
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
          Placeholder.configure({ placeholder: 'Write a comment!' }),
          CustomMention.configure({
            HTMLAttributes: {
              class: 'mention',
            },
            suggestion: {
              items: ({ query }) => {
                const suggestions = getAllCommenters
                  .map(({ username, id }) => ({ username, id }))
                  .filter(({ username }) =>
                    username.toLowerCase().startsWith(query.toLowerCase())
                  )
                  .slice(0, 5);
                return suggestions;
              },
              render: () => {
                let popup: any;

                const selectItem = (
                  props: SuggestionProps,
                  item: { username: string; id: string }
                ) => {
                  if (item) {
                    props.command({
                      id: item.id,
                      label: item.username,
                    });
                  }
                };

                const menu = (props: SuggestionProps) => {
                  const div = document.createElement('div');
                  const items = document.createElement('div');
                  items.className = 'items';

                  props.items.forEach(
                    (suggestion: { username: string; id: string }) => {
                      const button = document.createElement('button');
                      button.innerText = suggestion.username;
                      button.className = 'item';
                      button.addEventListener('click', function () {
                        selectItem(props, suggestion);
                      });
                      items.appendChild(button);
                    }
                  );

                  div.appendChild(items);
                  return div.firstChild;
                };
                return {
                  onStart: props => {
                    // @ts-ignore
                    popup = tippy('body', {
                      getReferenceClientRect: props.clientRect,
                      appendTo: () =>
                        document.getElementById('commentcarp') as Element,
                      content: () => {
                        return menu(props);
                      },
                      theme: 'commentcarp-mentions',
                      showOnCreate: true,
                      interactive: true,
                      allowHTML: true,
                      arrow: false,
                      trigger: 'manual',
                      placement: 'top-start',
                    });
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
        onTransaction: () => {
          this.buttons.forEach(button => {
            button.active = button.isActive() as boolean;
          });
        },
      });

      this.editorLoaded = true;
    },
    buttons: [
      {
        active: false,
        isActive: () => window.editor?.isActive('bold'),
        name: 'Bold',
        onClick: () => {
          window.editor!.chain().toggleBold().focus().run();
        },
        icon: `<svg
            viewBox="0 0 24 24"
            id="icon--bold"
            height="14"
            width="14"
            fill="currentColor"
          >
            <path
              d="M17.194 10.962A6.271 6.271 0 0012.844.248H4.3a1.25 1.25 0 000 2.5h1.013a.25.25 0 01.25.25V21a.25.25 0 01-.25.25H4.3a1.25 1.25 0 100 2.5h9.963a6.742 6.742 0 002.93-12.786zm-4.35-8.214a3.762 3.762 0 010 7.523H8.313a.25.25 0 01-.25-.25V3a.25.25 0 01.25-.25zm1.42 18.5H8.313a.25.25 0 01-.25-.25v-7.977a.25.25 0 01.25-.25h5.951a4.239 4.239 0 010 8.477z"
            ></path>
          </svg>`,
        init: (element: Element) => {
          tippy(element, {
            content: 'Bold',
            arrow: true,
            theme: 'commentcarp-dark',
          });
        },
      },
      {
        active: false,
        isActive: () => window.editor?.isActive('italic'),
        name: 'Italic',
        onClick: () => {
          window.editor!.chain().toggleItalic().focus().run();
        },
        icon: `<svg viewBox="0 0 24 24" id="icon--italic" fill="currentColor">
          <path
            d="M22.5.248h-7.637a1.25 1.25 0 000 2.5h1.086a.25.25 0 01.211.384L4.78 21.017a.5.5 0 01-.422.231H1.5a1.25 1.25 0 000 2.5h7.637a1.25 1.25 0 000-2.5H8.051a.25.25 0 01-.211-.384L19.22 2.98a.5.5 0 01.422-.232H22.5a1.25 1.25 0 000-2.5z"
          ></path>
        </svg>`,
        init: (element: Element) => {
          tippy(element, {
            content: 'Italic',
            arrow: true,
            theme: 'commentcarp-dark',
          });
        },
      },
      {
        active: false,
        isActive: () => window.editor?.isActive('bulletList'),
        name: 'List',
        onClick: () => {
          window.editor!.chain().toggleBulletList().focus().run();
        },
        icon: `<svg viewBox="0 0 24 24" id="icon--ul" fill="currentColor">
          <circle cx="2.5" cy="3.998" r="2.5"></circle>
          <path d="M8.5 5H23a1 1 0 000-2H8.5a1 1 0 000 2z"></path>
          <circle cx="2.5" cy="11.998" r="2.5"></circle>
          <path d="M23 11H8.5a1 1 0 000 2H23a1 1 0 000-2z"></path>
          <circle cx="2.5" cy="19.998" r="2.5"></circle>
          <path d="M23 19H8.5a1 1 0 000 2H23a1 1 0 000-2z"></path>
        </svg>`,
        init: (element: Element) => {
          tippy(element, {
            content: 'List',
            arrow: true,
            theme: 'commentcarp-dark',
          });
        },
      },
      {
        active: false,
        isActive: () => window.editor?.isActive('code'),
        name: 'Inline code',
        onClick: () => {
          window.editor!.chain().toggleCode().focus().run();
        },
        icon: `<svg viewBox="0 0 24 24" id="icon--code" fill="currentColor">
          <path
            d="M9.147 21.552a1.244 1.244 0 01-.895-.378L.84 13.561a2.257 2.257 0 010-3.125l7.412-7.613a1.25 1.25 0 011.791 1.744l-6.9 7.083a.5.5 0 000 .7l6.9 7.082a1.25 1.25 0 01-.9 2.122zm5.707 0a1.25 1.25 0 01-.9-2.122l6.9-7.083a.5.5 0 000-.7l-6.9-7.082a1.25 1.25 0 011.791-1.744l7.411 7.612a2.257 2.257 0 010 3.125l-7.412 7.614a1.244 1.244 0 01-.89.38zm6.514-9.373z"
          ></path>
        </svg>`,
        init: (element: Element) => {
          tippy(element, {
            content: 'Inline code',
            arrow: true,
            theme: 'commentcarp-dark',
          });
        },
      },
      {
        active: false,
        isActive: () => window.editor?.isActive('codeBlock'),
        name: 'Code block',
        onClick: () => {
          window.editor!.chain().toggleCodeBlock().focus().run();
        },
        icon: `<svg viewBox="0 0 24 24" id="icon--code" fill="currentColor">
          <path
            d="M9.147 21.552a1.244 1.244 0 01-.895-.378L.84 13.561a2.257 2.257 0 010-3.125l7.412-7.613a1.25 1.25 0 011.791 1.744l-6.9 7.083a.5.5 0 000 .7l6.9 7.082a1.25 1.25 0 01-.9 2.122zm5.707 0a1.25 1.25 0 01-.9-2.122l6.9-7.083a.5.5 0 000-.7l-6.9-7.082a1.25 1.25 0 011.791-1.744l7.411 7.612a2.257 2.257 0 010 3.125l-7.412 7.614a1.244 1.244 0 01-.89.38zm6.514-9.373z"
          ></path>
        </svg>`,
        init: (element: Element) => {
          tippy(element, {
            content: 'Code block',
            arrow: true,
            theme: 'commentcarp-dark',
          });
        },
      },
    ],
    editor: () => {
      return window.editor;
    },
    addListener() {
      window.addEventListener(
        'message',
        event => {
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
        this.comments.isLoading = false;
        this.comments.list = getAllComments;
      } catch (err) {
        this.comments.isLoading = false;
      }
    },
    getLink(user: ConvertedUserInterface) {
      switch (user.provider) {
        case 'twitter':
          return `https://twitter.com/i/user/${user.platformId}`;
      }
    },
    async checkLogin() {
      const user = await auth();
      if (user.getMyCommenterProfile) {
        this.user = user.getMyCommenterProfile;
        this.loading = false;
        this.loggedIn = true;
      } else {
        this.loading = false;
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
          window.editor?.commands.clearContent();
          this.content = '';
        } catch (err: any) {
          this.loading = false;
          this.errorMessage = err.toString().replace('Error:', '');
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
        'Twitter Login',
        `
        height=${h},
        width=${w}, 
        top=${top}, 
        left=${left}
      `
      );
    },
    isButtonDisabled() {
      if (!this.loading) {
        if (this.loggedIn) {
          if (this.content === '' || this.editor()?.isEmpty) {
            return true;
          }
          return false;
        }
        return false;
      }
      return true;
    },
    reply({
      userId,
      username,
      replyto,
    }: {
      userId: string;
      username: string;
      replyto: string;
    }) {
      this.editor()
        ?.chain()
        .insertContent(
          `<span data-type="mention" class="mention" data-id="${userId}" data-replyto="${replyto}" data-label="${username}" contenteditable="false">@${username}</span> `
        )
        .focus()
        .run();
    },
  };
};

window.comment = comment;
