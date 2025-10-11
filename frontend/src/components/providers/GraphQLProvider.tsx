'use client';

import React from 'react';
import { ApolloProvider } from '@apollo/client/react';
import client from '@/lib/apollo-client';

interface GraphQLProviderProps {
  children: React.ReactNode;
}

export function GraphQLProvider({ children }: GraphQLProviderProps) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}


