import React, { Suspense } from 'react';

const EventCardShareModal = React.lazy(() => import('./EventCardShareModal'));

/** The share-poster modal, loaded only when first opened (it pulls in html2canvas). */
export const LazyShareModal: React.FC<React.ComponentProps<typeof EventCardShareModal>> = (props) => (
  <Suspense fallback={null}>
    <EventCardShareModal {...props} />
  </Suspense>
);

const BirthdayShareModal = React.lazy(() => import('./BirthdayShareModal'));

/** The themed birthday poster modal, loaded on first open. */
export const LazyBirthdayShareModal: React.FC<React.ComponentProps<typeof BirthdayShareModal>> = (props) => (
  <Suspense fallback={null}>
    <BirthdayShareModal {...props} />
  </Suspense>
);
