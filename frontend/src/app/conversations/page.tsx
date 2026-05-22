'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { ConversationList } from '@/components/conversations/ConversationList';

export default function ConversationsPage() {
  return (
    <PageLayout mobileTitle="Conversations" scrollable>
      <ConversationList />
    </PageLayout>
  );
}
