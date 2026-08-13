import { createClient, cacheExchange, fetchExchange, gql } from "urql";

// AniList public GraphQL endpoint -- no auth needed for reads.
// preferGetMethod: false forces POST. AniList's endpoint only accepts
// POST; urql will otherwise send short queries as GET and get a 404.
// Free tier: ~1 req/sec, returns 429 over quota. cacheExchange keeps
// repeated queries (same title, same season) from re-hitting the API.
export const anilistClient = createClient({
  url: "https://graphql.anilist.co",
  exchanges: [cacheExchange, fetchExchange],
  requestPolicy: "cache-first",
  preferGetMethod: false,
  fetchOptions: {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  },
});

const MEDIA_FIELDS = `
  id
  type
  format
  status
  title { romaji english native }
  coverImage { extraLarge large color }
  bannerImage
  description(asHtml: false)
  episodes
  chapters
  volumes
  genres
  averageScore
  seasonYear
`;

export const SEARCH_MEDIA = gql`
  query Search($search: String!, $type: MediaType, $page: Int = 1) {
    Page(page: $page, perPage: 24) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(search: $search, type: $type, sort: SEARCH_MATCH, isAdult: false) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

export const TRENDING_MEDIA = gql`
  query Trending($type: MediaType, $page: Int = 1) {
    Page(page: $page, perPage: 24) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(type: $type, sort: TRENDING_DESC, isAdult: false) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

export const MEDIA_BY_ID = gql`
  query MediaById($id: Int!) {
    Media(id: $id) {
      ${MEDIA_FIELDS}
    }
  }
`;