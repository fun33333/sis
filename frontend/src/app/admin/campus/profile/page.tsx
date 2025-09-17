// "use client"
// import { useQuery, gql } from "@apollo/client";
// import { useParams } from "next/navigation";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { CampusHeader } from "@/components/dashboard/campus-header";
// import { StaffSummaryCards } from "@/components/dashboard/staff-summary-cards";
// import { CampusCharts } from "@/components/dashboard/campus-charts";
// // ...import other icons/components...

// const CAMPUS_PROFILE_QUERY = gql`
//   query GetCampusProfile($id: ID!) {
//     campus(id: $id) {
//       campusName
//       campusCode
//       campusDescription
//       status
//       governingBody
//       registrationNumber
//       address
//       establishedDate
//       totalStudents
//       totalTeachers
//       totalStaff
//       capacity
//       occupancyRate
//       gradesOffered
//       languages
//       facilities
//       accreditation
//       rating
//       staffSummary {
//         totalTeachers
//         totalNonTeachingStaff
//         totalStudents
//         hrContact
//         admissionContact
//       }
//       quickStats {
//         title
//         value
//         change
//         trend
//         icon
//         color
//       }
//     }
//   }
// `;

// export default function CampusProfilePage() {
//   const params = useParams();
//   const campusId = params.campusId as string;

//   const { data, loading, error } = useQuery(CAMPUS_PROFILE_QUERY, {
//     variables: { id: campusId },
//   });

//   if (loading) return <div className="text-center py-20">Loading...</div>;
//   if (error) return <div className="text-center py-20 text-red-500">Error loading campus data.</div>;

//   const campusData = data.campus;
//   const staffSummaryData = campusData.staffSummary;
//   const quickStats = campusData.quickStats;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
//       <div className="container mx-auto px-4 py-8 space-y-8">
//         <CampusHeader
//           campusName={campusData.campusName}
//           campusStatus={campusData.status}
//           tagline="Excellence in Education Since 1985"
//           onImageEdit={() => {}}
//         />
//         {/* ...baqi code same, bas data campusData, staffSummaryData, quickStats se aayega... */}
//       </div>
//     </div>
//   );
// }

"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, Building2, TrendingUp, Award, BookOpen, MapPin, Calendar, Phone, Mail, } from "lucide-react"
import { CampusHeader } from "@/components/dashboard/campus-header"
import { StaffSummaryCards } from "@/components/dashboard/staff-summary-cards"
import { CampusCharts } from "@/components/dashboard/campus-charts"
import { useEffect, useState } from "react"

// Mock async fetch function (replace with real GraphQL query later)
async function fetchCampusDashboardData() {
  return {
    campusData: {
      campusName: "Idara Al-Khair Campus Four",
      campusCode: "IAK-C04",
      campusDescription: "A premier educational institution dedicated to fostering academic excellence and character development in a nurturing environment.",
      status: "Active",
      governingBody: "State Education Board",
      registrationNumber: "EDU-2019-001234",
      address: "123 Education Boulevard, Academic District, Springfield, ST 12345",
      establishedDate: "August 15, 1995",
      totalStudents: 256,
      totalTeachers: 24,
      totalStaff: 45,
      capacity: 1500,
      occupancyRate: 88,
      gradesOffered: ["K-12"],
      languages: ["English", "Urdu"],
      facilities: ["Library", "Labs", "Sports Complex", "Auditorium", "Transport"],
      accreditation: "State Board Certified",
      rating: 4.8,
    },
    staffSummaryData: {
      totalTeachers: 24,
      totalNonTeachingStaff: 7,
      totalStudents: 256,
      hrContact: "hr@greenwoodacademy.edu",
      admissionContact: "admissions@greenwoodacademy.edu",
    },
    quickStats: [
      {
        title: "Student Enrollment",
        value: "256",
        change: "+12%",
        trend: "up",
        icon: Users,
        color: "text-blue-600",
      },
      {
        title: "Faculty Members",
        value: "24",
        change: "+5%",
        trend: "up",
        icon: GraduationCap,
        color: "text-green-600",
      },
      {
        title: "Campus Capacity",
        value: "88%",
        change: "+3%",
        trend: "up",
        icon: Building2,
        color: "text-purple-600",
      },
      {
        title: "Academic Rating",
        value: "4.8/5",
        change: "+0.2",
        trend: "up",
        icon: Award,
        color: "text-orange-600",
      },
    ]
  };
}

export default function CampusDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    document.title = "Campus Profile | IAK SMS";
    fetchCampusDashboardData().then(setDashboardData);
  }, []);

  if (!dashboardData) {
    return <div className="text-center py-20">Loading...</div>;
  }

  const { campusData, staffSummaryData, quickStats } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <CampusHeader
          campusName={campusData.campusName}
          campusStatus={campusData.status as "Active" | "Inactive" | "Temporary Closed"}
          tagline="Excellence in Education Since 1985"
          onImageEdit={() => { }}
        />

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat: any, index: number) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-green-600">{stat.change}</span>
                      <span className="text-sm text-muted-foreground ml-1">vs last year</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-slate-100 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Staff Summary Cards */}
        <StaffSummaryCards data={staffSummaryData} />
        {/* Charts Section */}
        <div className="lg:col-span-3">
          <CampusCharts />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Campus Information Cards */}
          <div className="lg:col-span-5 space-y-6">
            {/* Campus Overview */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Campus Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Campus Code</p>
                        <p className="text-sm text-muted-foreground">{campusData.campusCode}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Established</p>
                        <p className="text-sm text-muted-foreground">{campusData.establishedDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Accreditation</p>
                        <Badge variant="secondary">{campusData.accreditation}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Grades Offered</p>
                        <p className="text-sm text-muted-foreground">Kindergarten - Grade 12</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Languages</p>
                        <p className="text-sm text-muted-foreground">{campusData.languages.join(", ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Governing Body</p>
                        <p className="text-sm text-muted-foreground">{campusData.governingBody}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Campus Description</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{campusData.campusDescription}</p>
                </div>
              </CardContent>
            </Card>

            {/* Facilities & Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-green-600" />
                    Facilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {campusData.facilities.map((facility: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-purple-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">HR Department</p>
                      <p className="text-sm text-muted-foreground">{staffSummaryData.hrContact}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Admissions</p>
                      <p className="text-sm text-muted-foreground">{staffSummaryData.admissionContact}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
