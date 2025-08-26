"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { ArrowLeftIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  contactSessionIdAtomFamily,
  conversationIdAtom,
  errorMessageAtom,
  organizationIdAtom,
  screenAtom,
} from "../../atoms/widget-atoms";

import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { WidgetHeader } from "../components/widget-header";
import { WidgetFooter } from "../components/widget-footer";
import{ConversationStatusIcon} from "@workspace/ui/components/conversation-status-icon"
import { Button } from "@workspace/ui/components/button";
import { usePaginatedQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";

export const WidgetInboxScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const organizationId = useAtomValue(organizationIdAtom);

  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

  const conversations = usePaginatedQuery(
    api.public.conversations.getMany,
    contactSessionId
      ? {
          contactSessionId,
        }
      : "skip",
    {
      initialNumItems: 10,
    }
  );


  const {topElementRef, handleLoadMore , canLoadMore, isLoadingMore} = useInfiniteScroll({
    status: conversations.status,
    loadMore: conversations.loadMore,
    loadSize:10
  });

  const errorMessage = useAtomValue(errorMessageAtom);

  return (
    <>
      <WidgetHeader>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setScreen("selection")}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <p className="text-sm font-medium">Inbox</p>
        </div>
      </WidgetHeader>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {conversations?.results.length > 0 &&
          conversations.results.map((conversation) => (
            <Button
              className="h-20 w-full justify-between rounded-lg border px-3 py-2 text-left"
              key={conversation._id}
              onClick={() => {
                setConversationId(conversation._id);
                setScreen("chat");
              }}
              variant="outline"
            >
              <div className="flex w-full flex-col gap-2 overflow-hidden">
                <div className="flex w-full items-center justify-between">
                  <p className="text-xs text-muted-foreground">Chat</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation._creationTime))}
                  </p>
                </div>
                <div className="flex w-full items-center justify-between gap-x-2">
                  <p className="truncate text-sm">
                    {conversation.lastMessage?.text}
                  </p>
                  <ConversationStatusIcon
                  status={conversation.status}
                  className="shrink-0"/>

                </div>
              </div>
            </Button>
          ))}


          <InfiniteScrollTrigger
          canLoadMore={canLoadMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
          ref={topElementRef}
          
          
          />
      </div>

      <WidgetFooter />
    </>
  );
};
