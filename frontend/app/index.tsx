import React from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to auth/welcome, the actual routing is handled by _layout.tsx
  return <Redirect href="/auth/welcome" />;
}
