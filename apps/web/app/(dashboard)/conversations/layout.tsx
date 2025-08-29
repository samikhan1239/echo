import { ConversationsLayout } from "@/modules/dashboard/ui/layouts/conversations-layout";

const Layout = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <ConversationsLayout>
    {children}
  </ConversationsLayout>
);

export default Layout;
