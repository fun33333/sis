import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, Phone, Mail, Calculator } from "lucide-react"

interface StaffSummaryData {
  totalTeachers: number
  totalNonTeachingStaff: number
  totalStudents: number
  hrContact: string
  admissionContact: string
}

interface StaffSummaryCardsProps {
  data: StaffSummaryData
}

export function StaffSummaryCards({ data }: StaffSummaryCardsProps) {
  const teacherStudentRatio = data.totalStudents > 0 ? (data.totalStudents / data.totalTeachers).toFixed(1) : "0"

  const summaryCards = [
    {
      title: "Total Teachers",
      value: data.totalTeachers.toLocaleString(),
      icon: GraduationCap,
      description: "Teaching staff members",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Non-Teaching Staff",
      value: data.totalNonTeachingStaff.toLocaleString(),
      icon: Users,
      description: "Administrative & support staff",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Teacher-Student Ratio",
      value: `1:${teacherStudentRatio}`,
      icon: Calculator,
      description: "Students per teacher",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                    <p className="text-3xl font-bold text-foreground">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                  </div>
                  <div className={`${card.bgColor} p-3 rounded-full`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Contact Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* HR Contact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Staff Contact (HR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{data.hrContact || "hr@campus.edu"}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Human Resources
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Admission Contact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Admission Office Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{data.admissionContact || "admissions@campus.edu"}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Student Admissions
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
