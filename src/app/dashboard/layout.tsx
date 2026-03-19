export default function DashboardLayout({
  children,
  recent,
  modal,
}: {
  children: React.ReactNode;
  recent: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      {children}
      {recent}
      {modal}
    </div>
  );
}
