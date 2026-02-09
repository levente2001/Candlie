import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function Aszf() {
  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['legal-docs'],
    queryFn: () => base44.entities.LegalDoc.list('-created_date'),
  });

  const doc = docs.find((d) => d.key === 'legal') || docs[0];
  const url = doc?.aszf_url || '';
  const isPdf = url.toLowerCase().endsWith('.pdf');

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[var(--candlie-bg)] text-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-semibold mb-6">ÁSZF</h1>

        {isLoading ? (
          <p className="text-black/60">Betöltés...</p>
        ) : url ? (
          <div className="space-y-4">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center h-12 px-5 rounded-xl bg-[var(--candlie-pink-secondary)] text-white font-semibold"
            >
              ÁSZF megnyitása
            </a>
            {isPdf && (
              <div className="w-full h-[70vh] bg-white border border-black/10 rounded-2xl overflow-hidden">
                <iframe title="ÁSZF" src={url} className="w-full h-full" />
              </div>
            )}
          </div>
        ) : (
          <p className="text-black/60">Az ÁSZF még nincs feltöltve.</p>
        )}
      </div>
    </div>
  );
}
