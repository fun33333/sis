"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getPrincipalById } from "@/lib/api"
import { ArrowLeft, User, GraduationCap, Briefcase, Mail, Phone, MapPin, Calendar, Clock, Award, School, Download, Share } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Theme colors - IAK SMS Brand Colors
const themeColors = {
  primary: '#274c77',      // Dark Blue
  secondary: '#6096ba',    // Medium Blue  
  accent: '#a3cef1',       // Light Blue
  success: '#16a34a',      // Green
  warning: '#f59e0b',      // Orange
  error: '#dc2626',        // Red
  info: '#3b82f6',         // Blue
  purple: '#9333ea',       // Purple
  pink: '#ec4899',         // Pink
  gray: '#6b7280'          // Gray
}

function PrincipalProfileContent() {
  const [mounted, setMounted] = useState(false)
  const [principal, setPrincipal] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const params = useSearchParams()
  const principalId = params?.get("id") || ""
  
  if (!principalId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Principal Not Found</h2>
          <p className="text-gray-600 mb-4">No principal ID provided</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !principalId) return

    const fetchPrincipalData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const principalData = await getPrincipalById(parseInt(principalId))
        if (principalData) {
          setPrincipal(principalData)
        } else {
          setError('Principal not found')
        }
      } catch (err) {
        console.error('Error fetching principal:', err)
        setError('Failed to load principal data')
      } finally {
        setLoading(false)
      }
    }

    fetchPrincipalData()
  }, [mounted, principalId])

  if (!mounted) {
    return <LoadingSpinner />
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!principal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Principal Not Found</h2>
          <p className="text-gray-600 mb-4">The requested principal could not be found</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* VIP Header with Gradient */}
        <div className="mb-8">
          <Button
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="relative overflow-hidden rounded-2xl shadow-xl" style={{ background: 'linear-gradient(135deg, #274c77 0%, #6096ba 100%)' }}>
            <div className="absolute inset-0 bg-black opacity-5"></div>
            <div className="relative p-8 text-white">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  {/* Profile Picture Placeholder */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
                      <User className="w-12 h-12" style={{ color: themeColors.primary }} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: principal?.is_currently_active ? themeColors.success : themeColors.error }}>
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    </div>
                  </div>
                  
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{principal?.full_name || 'Principal Profile'}</h1>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-sm opacity-90">Employee Code: {principal?.employee_code || principalId}</span>
                      </div>
                      <Badge variant="secondary" className="bg-white bg-opacity-20 text-white border-0">
                        {principal?.shift || 'N/A'} Shift
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="secondary" size="sm" className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="secondary" size="sm" className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Principal Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-2 hover:shadow-xl transition-shadow duration-300" style={{ borderColor: themeColors.accent }}>
            <CardHeader className="pb-4" style={{ background: `linear-gradient(to right, ${themeColors.accent}15, transparent)` }}>
              <CardTitle className="text-lg font-semibold flex items-center gap-2" style={{ color: themeColors.primary }}>
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${themeColors.primary}10` }}>
                    <User className="w-5 h-5" style={{ color: themeColors.primary }} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{principal?.full_name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Full Name</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${themeColors.info}10` }}>
                    <Mail className="w-5 h-5" style={{ color: themeColors.info }} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{principal?.email || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Email</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${themeColors.success}10` }}>
                    <Phone className="w-5 h-5" style={{ color: themeColors.success }} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{principal?.contact_number || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Contact</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${themeColors.warning}10` }}>
                    <MapPin className="w-5 h-5" style={{ color: themeColors.warning }} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{principal?.campus_name || principal?.campus?.campus_name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Campus</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${themeColors.purple}10` }}>
                    <Clock className="w-5 h-5" style={{ color: themeColors.purple }} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{principal?.shift || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Shift</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-2 hover:shadow-xl transition-shadow duration-300" style={{ borderColor: themeColors.secondary }}>
            <CardHeader className="pb-4" style={{ background: `linear-gradient(to right, ${themeColors.secondary}15, transparent)` }}>
              <CardTitle className="text-lg font-semibold flex items-center gap-2" style={{ color: themeColors.primary }}>
                <Briefcase className="w-5 h-5" />
                Employment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium">{principal?.employee_code || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Employee Code</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium">{principal?.joining_date ? new Date(principal.joining_date).toLocaleDateString() : 'N/A'}</div>
                    <div className="text-sm text-gray-500">Joining Date</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium">{principal?.total_experience_years || 0} Years</div>
                    <div className="text-sm text-gray-500">Experience</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <School className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium">{principal?.education_level || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Education Level</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-2 hover:shadow-xl transition-shadow duration-300" style={{ borderColor: themeColors.success }}>
            <CardHeader className="pb-4" style={{ background: `linear-gradient(to right, ${themeColors.success}15, transparent)` }}>
              <CardTitle className="text-lg font-semibold flex items-center gap-2" style={{ color: themeColors.primary }}>
                <Award className="w-5 h-5" />
                Status & Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: principal?.is_currently_active ? themeColors.success : themeColors.error }}></div>
                  <div>
                    <div className="font-medium">{principal?.is_currently_active ? 'Active' : 'Inactive'}</div>
                    <div className="text-sm text-gray-500">Current Status</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Details */}
        <Card className="bg-white shadow-lg border-2 hover:shadow-xl transition-shadow duration-300" style={{ borderColor: themeColors.primary }}>
          <CardHeader className="pb-4" style={{ background: `linear-gradient(to right, ${themeColors.primary}15, transparent)` }}>
            <CardTitle className="text-lg font-semibold flex items-center gap-2" style={{ color: themeColors.primary }}>
              <GraduationCap className="w-5 h-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="font-medium text-gray-700 mb-2">CNIC</div>
                <div className="text-gray-600">{principal?.cnic || 'N/A'}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700 mb-2">Date of Birth</div>
                <div className="text-gray-600">{principal?.dob ? new Date(principal.dob).toLocaleDateString() : 'N/A'}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700 mb-2">Gender</div>
                <div className="text-gray-600 capitalize">{principal?.gender || 'N/A'}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700 mb-2">Year of Passing</div>
                <div className="text-gray-600">{principal?.year_of_passing || 'N/A'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="font-medium text-gray-700 mb-2">Institution Name</div>
                <div className="text-gray-600">{principal?.institution_name || 'N/A'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="font-medium text-gray-700 mb-2">Permanent Address</div>
                <div className="text-gray-600">{principal?.permanent_address || 'N/A'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PrincipalProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <PrincipalProfileContent />
    </Suspense>
  )
}

