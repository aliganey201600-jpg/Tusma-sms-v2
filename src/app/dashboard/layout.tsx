// Root dashboard layout — each role sub-folder provides its own full layout
// (admin, student, teacher, parent, super-admin each have their own layout.tsx)
export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
