export default function TeacherLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="min-h-screen bg-[#e7ecef]">
        {children}
      </div>
    )
  }