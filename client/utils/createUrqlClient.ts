import { dedupExchange, fetchExchange, stringifyVariables } from 'urql';
import { cacheExchange, Resolver, Cache } from '@urql/exchange-graphcache'
import { DeletePostMutationVariables, LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation, VoteMutationVariables } from '../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';
      
// exchange for all errors instead of checking for every submit different error messages
import { pipe, tap } from 'wonka';
import { Exchange } from 'urql';
import router from 'next/router';
import { gql } from 'graphql-tag';
import { isServer } from './isServer';

export const errorExchange: Exchange = ({ forward }) => ops$ => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      // If the OperationResult has an error send a request to sentry
      if (error) {
        // the error is a CombinedError with networkError and graphqlErrors properties
        if(error?.message.includes("not aut henticated")) {
          router.replace("/login"); 
      }
      }
    })
  );
};

// import { stringifyVariables } from '@urql/core';
// import { Resolver, Variables, NullArray } from '../types';

export type MergeMode = 'before' | 'after';
 
export interface PaginationParams {
  offsetArgument?: string;
  limitArgument?: string;
  mergeMode?: MergeMode;
}

export const cursorPagination = (): Resolver => {

  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    // console.log(entityKey, fieldName);
    const allFields = cache.inspectFields(entityKey);
    // console.log("all fields", allFields);
    
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    
    if (size === 0) {
      return undefined;
    };
    // console.log("field args: ", fieldArgs);
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    // console.log("key we created: ", fieldKey);
    const isItInTheCache = cache.resolve(cache.resolve(entityKey, fieldKey) as string, 'posts');
    info.partial = !isItInTheCache;
    let hasMore = true;
    let results: string[] = [];
    // return data from cache
    fieldInfos.forEach(fi => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;  
      const data = cache.resolve(key, "posts") as string[];   
      const _hasMore = cache.resolve(key, "hasMore");   
      if(!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      // console.log("data:", data);
      results.push(...data);
    });

    // console.log("results", results);
    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results
    };
  };
}

function invalidateAllPosts(cache: Cache) {
  const allFields = cache.inspectFields('Query');
  const fieldInfos = allFields.filter((info) => info.fieldName === 'posts');
  fieldInfos.forEach((fi) => {
    cache.invalidate('Query', 'posts', fi.arguments || {});
  })
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = '';
  if(isServer()) {
    cookie = ctx?.req?.headers?.cookie;
  }
  
  return ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
    headers: cookie 
      ? {
        cookie
      }
      : undefined

  },
  exchanges: [dedupExchange, cacheExchange({
    keys: {
        PaginatedPosts: () => null,
    },
    resolvers: {
      Query: {
        posts: cursorPagination(),   // must match posts graphql name
      }
    },
    updates: {
      Mutation: {
        deletePost: (_result, args, cache, info) => {
          cache.invalidate({ __typename: 'Post', id: (args as DeletePostMutationVariables).id });
        },
        vote: (_result, args, cache, info) => {
          const { postId, value } = args as VoteMutationVariables;
          const data = cache.readFragment(
            gql`
              fragment _ on Post {
                id
                points
                voteStatus
              }
            `,
            { id: postId } as any
          );  
          // console.log("data: ", data);
          if(data) {
            if(data.voteStatus === value) return;
            
            const newPoints = (data.points as number) + ((!data.voteStatus ? 1 : 2) * value);
            cache.writeFragment(
              gql`
                fragment __ on Post {
                  points
                  voteStatus
                }
              `,
              { id: postId, points: newPoints, voteStatus: value } as any
            );
          }
        },
        createPost: (_result, args, cache, info) => {
          // console.log('start');
          // console.log(cache.inspectFields('Query'));
          invalidateAllPosts(cache);
          // invalidate cache
          // cache.invalidate("Query", "posts", {
          //   limit: 15
          // });
          // console.log(cache.inspectFields('Query'));
          // console.log('end');
        },
        logout: (_result, args, cache, info) => {
          betterUpdateQuery<LogoutMutation, MeQuery>(
            cache, 
            {query: MeDocument}, 
            _result,
            () => ({ me: null })
          )
        },
        login: (_result, args, cache, info) => {
          // cache.updateQuery({ query: MeDocument }, (data: MeQuery) => {});
          betterUpdateQuery<LoginMutation, MeQuery>(
            cache, 
            { query: MeDocument },
            _result,
            (result, query) => {
              if(result.login.errors) {
                return query;
              } else {
                return {
                  me: result.login.user
                }
              }
            }
          );
          invalidateAllPosts(cache);
        },
        register: (_result, args, cache, info) => {
          betterUpdateQuery<RegisterMutation, MeQuery>(
            cache, 
            { query: MeDocument },
            _result,
            (result, query) => {
              if(result.register.errors) {
                return query;
              } else {
                return {
                  me: result.register.user
                }
              }
            }
          )
        },
      }
    },
  }),
  errorExchange,
  ssrExchange, 
  fetchExchange]
})};