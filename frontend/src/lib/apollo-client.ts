import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// HTTP link to GraphQL endpoint
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql/',
});

// Auth link to add JWT token to requests
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from localStorage if it exists
  const token = typeof window !== 'undefined' ? localStorage.getItem('sis_token') : null;
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `JWT ${token}` : '',
    }
  };
});

// Error link for handling GraphQL errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((error: any) => {
      console.error(
        `[GraphQL error]: Message: ${error.message}, Location: ${error.locations}, Path: ${error.path}`
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    
    // Handle 401 errors (unauthorized)
    const statusCode = (networkError as any).statusCode;
    if (statusCode === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sis_token');
        localStorage.removeItem('sis_user');
        window.location.href = '/login';
      }
    }
  }
});

// Create Apollo Client
const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          allAttendances: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
          allStudentAttendances: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
      Attendance: {
        fields: {
          studentAttendances: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default client;

