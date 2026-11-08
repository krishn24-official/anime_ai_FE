import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EpisodeChapterSummaryModal } from '../../content/EpisodeChapterSummaryModal';
import { LazyShareModal } from '../../../components/LazyShareModal';
import type { HomeCard } from '../homeCards';

/**
 * Opening and sharing home cards. Render `modals` once in the section that uses it.
 */
export const useCardActions = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<{ type: 'episode' | 'chapter'; id: string } | null>(null);
  const [shared, setShared] = useState<HomeCard | null>(null);

  const open = (card: HomeCard) => {
    const t = card.target;
    switch (t.kind) {
      case 'content':
        return navigate(`/content/${t.type}/${t.id}`);
      case 'episode':
      case 'chapter':
        return setSummary({ type: t.kind, id: t.id });
      case 'character':
        return navigate('/characters', { state: { autoOpenName: t.name } });
      case 'actor':
        return navigate(`/actors/${t.id}`);
      case 'search':
        return navigate('/content', { state: { searchQuery: t.query } });
    }
  };

  const modals = (
    <>
      <EpisodeChapterSummaryModal
        isOpen={summary !== null}
        onClose={() => setSummary(null)}
        type={summary?.type ?? 'episode'}
        contentId={summary?.id ?? ''}
      />
      {shared?.share && (
        <LazyShareModal isOpen onClose={() => setShared(null)} event={{ ...shared.share, poster: shared.image ?? '' }} />
      )}
    </>
  );

  return { open, share: setShared, modals };
};
