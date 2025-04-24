// Server Component - No 'use client' directive here
import React from 'react';
import FormDetailClientContent from './FormDetailClientContent';

// Server component can safely access params
export default function FormDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Extract ID on the server side
  const { id } = params;
  
  // Pass the extracted ID to the client component
  return <FormDetailClientContent id={id} />;
}