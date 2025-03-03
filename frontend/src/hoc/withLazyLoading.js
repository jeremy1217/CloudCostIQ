import React, { Suspense } from 'react';
import LoadingIndicator from '../components/LoadingIndicator';

export default function withLazyLoading(Component, loadingMessage = "Loading...") {
  return function LazyComponent(props) {
    return (
      <Suspense fallback={<LoadingIndicator message={loadingMessage} />}>
        <Component {...props} />
      </Suspense>
    );
  };
}