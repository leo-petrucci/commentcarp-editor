import { endpoint, key } from '../main';

export interface ConvertedUserInterface extends CommenterInterface {
  verified?: boolean;
}

export const auth = async (): Promise<{
  getMyCommenterProfile?: ConvertedUserInterface;
}> => {
  const body = JSON.stringify({
    query:
      'query {\r\n    getMyCommenterProfile {\r\n        username\r\n        displayName\r\n        photo\r\n    }\r\n}',
    variables: {},
  });
  try {
    return (await handleGraphQL({
      body,
      identifier: '?getMyCommenterProfile',
    })) as {
      getMyCommenterProfile: ConvertedUserInterface;
    };
  } catch (err) {
    return {};
  }
};

export interface CommentsInterface {
  id: string;
  origin: string;
  commenter: CommenterInterface;
  body: string;
}

export const fetchComments = async (): Promise<{
  getAllComments: CommentsInterface[];
}> => {
  const body = JSON.stringify({
    query:
      'query ($origin: String!, $key: String!) {\r\n    getAllComments (origin: $origin, key: $key) {\r\n        id\r\n        origin\r\n        createdAtReadable\r\n        commenter\r\n        { id\r\n        platformId\r\n        provider\r\n        displayName\r\n        username\r\n        photo\r\n }       body\r\n    }\r\n}',
    variables: { origin: window.location.href, key },
  });
  try {
    return (await handleGraphQL({
      body,
      identifier: '?getAllComments',
    })) as {
      getAllComments: CommentsInterface[];
    };
  } catch (err) {
    console.error(err);
    return { getAllComments: [] };
  }
};

export interface CommentResponseInterface {
  origin: string;
  commenter: CommenterInterface;
  body: string;
}

export const send = async (
  comment: string
): Promise<{ comment?: CommentResponseInterface }> => {
  const body = JSON.stringify({
    query:
      'mutation ($body: String!, $origin: String!, $key: String!) {\r\n    addOneComment (body: $body, origin: $origin, key: $key) {\r\n        body\r\n        origin\r\n                commenter\r\n        { username\r\n }    }\r\n}',
    variables: { origin: window.location.href, body: comment, key },
  });

  try {
    return (await handleGraphQL({
      body,
      identifier: '?addOneComment',
    })) as {
      comment: CommentResponseInterface;
    };
  } catch (err) {
    console.error(err);
    return {};
  }
};

export interface CommenterInterface {
  id: string;
  platformId: string;
  provider: 'twitter';
  username: string;
  displayName: string;
  photo: string;
}

export const fetchCommenters = async (): Promise<{
  getAllCommenters: CommenterInterface[];
}> => {
  const body = JSON.stringify({
    query: `
        query ($origin: String!, $key: String!) {
          getAllCommenters(origin: $origin, key: $key) {
            id
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
      body,
      identifier: '?getAllCommenters',
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
  if (parts.length === 2) return parts.pop()?.split(';').shift()!;
  return null;
}

const handleGraphQL = async ({
  body,
  identifier,
}: {
  body: string;
  identifier?: string;
}): Promise<unknown> => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const token = getCookie('token');
  if (token) headers.append('Authorization', `Bearer ${token}`);

  const result = await fetch(`${endpoint!}/api${identifier || ''}`, {
    method: 'POST',
    headers,
    body,
  }).then(response => response.json());

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
};
