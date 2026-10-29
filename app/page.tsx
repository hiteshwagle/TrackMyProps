import { redirect } from 'next/navigation';
import { getChatGPTUser, chatGPTSignInPath } from './chatgpt-auth';
import Home from './home';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const user = await getChatGPTUser();
  if (user) redirect('/dashboard');
  return <Home signInHref={chatGPTSignInPath('/dashboard')} />;
}
