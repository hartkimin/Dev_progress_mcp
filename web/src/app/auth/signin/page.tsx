import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import SignInForm from './SignInForm';

export const dynamic = 'force-dynamic';

export default async function SignIn() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/');
  }
  const devAuthEnabled = process.env.ENABLE_DEV_AUTH === 'true';
  return <SignInForm devAuthEnabled={devAuthEnabled} />;
}
