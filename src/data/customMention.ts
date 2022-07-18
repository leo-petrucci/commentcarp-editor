import Mention from '@tiptap/extension-mention';

export const CustomMention = Mention.extend({
  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {};
          }

          return {
            'data-id': attributes.id,
          };
        },
      },

      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-label'),
        renderHTML: attributes => {
          if (!attributes.label) {
            return {};
          }

          return {
            'data-label': attributes.label,
          };
        },
      },

      replyto: {
        default: null,
        parseHTML: (element: any) => element.getAttribute('data-replyto'),
        renderHTML: (attributes: any) => {
          if (!attributes.replyto) {
            return {};
          }

          return {
            'data-replyto': attributes.replyto,
          };
        },
      },
    };
  },
});
