import ProfileLayout from '../profile/layout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ProfileLayout>{children}</ProfileLayout>;
}
