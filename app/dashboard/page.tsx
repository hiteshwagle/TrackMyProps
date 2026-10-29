import { requireChatGPTUser, chatGPTSignOutPath } from '../chatgpt-auth';
import Dashboard from './dashboard';

export const dynamic = 'force-dynamic';
export default async function DashboardPage() {
  const user = await requireChatGPTUser('/dashboard');
  return (
    <Dashboard
      user={{ name: user.fullName || user.email.split('@')[0], email: user.email }}
      signOutHref={chatGPTSignOutPath('/')}
    />
  );
}
