"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAllTeachers } from "@/lib/api"

// Simple multi-step form similar to TeacherForm/StudentForm but trimmed for coordinator (frontend-only)

const steps = [
  { id: 1, title: "Personal Information" },
  { id: 2, title: "Contact Details" },
  { id: 3, title: "Campus & Role" },
]

export function CoordinatorForm() {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [invalidFields, setInvalidFields] = useState<string[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  // Selected teachers are tracked in formData.teacherIds; we render chips instead of search
  const [stageFilter, setStageFilter] = useState<string>("all") // all | pre-primary | primary | secondary

  // Static options
  const campusOptions = [1, 2, 3, 4, 5, 6, 8].map((n) => `Campus ${n}`)
  const gradeOptions = [
    "Nursery",
    "KG",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
  ]
  const sectionOptions = ["A", "B", "C", "D", "E"]

  const totalSteps = steps.length

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    if (invalidFields.includes(field)) {
      setInvalidFields((prev) => prev.filter((f) => f !== field))
    }
  }

  const handleToggleInArray = (field: string, value: string) => {
    setFormData((prev: any) => {
      const prevArr: string[] = Array.isArray(prev[field]) ? prev[field] : []
      const exists = prevArr.includes(value)
      const next = exists ? prevArr.filter((v) => v !== value) : [...prevArr, value]
      return { ...prev, [field]: next }
    })
    if (invalidFields.includes(field)) {
      setInvalidFields((prev) => prev.filter((f) => f !== field))
    }
  }

  // Lazy-load teachers only when Step 3 opens to avoid disruptive re-renders while typing
  useEffect(() => {
    if (currentStep !== 3 || (teachers && teachers.length > 0)) return
    let mounted = true
    ;(async () => {
      const all = await getAllTeachers()
      if (!mounted) return
      const list = Array.isArray(all) ? all : (Array.isArray((all as any)?.results) ? (all as any).results : [])
      setTeachers(list)
    })()
    return () => { mounted = false }
  }, [currentStep])

  const getTeacherId = (t: any) => t?.id ?? t?.pk ?? String(t?.name || t?.full_name)
  const getTeacherLabel = (t: any) => String(t?.name || t?.full_name || `Teacher ${getTeacherId(t)}`)
  const getTeacherClassesText = (t: any): string => {
    const possible = [t?.classes, t?.class_assigned, t?.current_class, t?.class, t?.sections, t?.grade]
    return String(possible.find((v) => v != null && v !== undefined) || "").toLowerCase()
  }
  const categorizeTeacher = (t: any): 'pre-primary' | 'primary' | 'secondary' | 'unknown' => {
    const text = getTeacherClassesText(t)
    if (!text) return 'unknown'
    // Pre-Primary: nursery, kg, prep
    if (/(nur|nursery|kg|prep|pre[- ]?primary)/i.test(text)) return 'pre-primary'
    // Extract any digits 1-10
    const has1to5 = /(\b|\D)(1|2|3|4|5)(\b|\D)/.test(text) || /(grade\s*[1-5]|class\s*[1-5])/i.test(text)
    const has6to10 = /(\b|\D)(6|7|8|9|10)(\b|\D)/.test(text) || /(grade\s*(?:6|7|8|9|10)|class\s*(?:6|7|8|9|10)|ix|x\b)/i.test(text)
    if (has6to10) return 'secondary'
    if (has1to5) return 'primary'
    return 'unknown'
  }
  const selectedTeachers = useMemo(() => {
    const ids: any[] = Array.isArray((formData as any)?.teacherIds) ? (formData as any).teacherIds : []
    return (teachers || []).filter((t: any) => ids.includes(getTeacherId(t)))
  }, [teachers, formData?.teacherIds])
  const visibleTeachers = useMemo(() => {
    if (stageFilter === 'all') return teachers || []
    return (teachers || []).filter((t: any) => {
      const cat = categorizeTeacher(t)
      if (cat === 'unknown') return false
      return cat === stageFilter
    })
  }, [teachers, stageFilter])

  const validateCurrentStep = () => {
    const requiredFields: { [step: number]: string[] } = {
      // Explicit required from user: highestQualification, coordinationExperience.
      // Add minimal essentials too for a coherent record.
      1: ["fullName", "gender", "dob", "highestQualification", "coordinationExperience"],
      2: ["email", "phone", "permanentAddress", "cnic"],
      3: ["campus", "shift"],
    }
    const required = requiredFields[currentStep] || []
    const invalid: string[] = []
    for (const field of required) {
      const value = formData[field]
      if (value == null || (typeof value === "string" && value.trim() === "")) {
        invalid.push(field)
      }
    }
    setInvalidFields(invalid)
    return invalid
  }

  const handleNext = () => {
    const invalid = validateCurrentStep()
    if (invalid.length > 0) {
      toast({ title: "Please fill required fields", description: invalid.join(", ") })
      return
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowPreview(true)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleStepChange = (step: number) => {
    if (step > currentStep) {
      const invalid = validateCurrentStep()
      if (invalid.length > 0) {
        toast({ title: "Please fill required fields", description: invalid.join(", ") })
        return
      }
    }
    setInvalidFields([])
    setCurrentStep(step)
  }

  const StepOne = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Full Name *</label>
          <input autoComplete="off" className={`w-full border rounded-md px-3 py-2 ${invalidFields.includes("fullName") ? "border-red-500" : "border-gray-300"}`} defaultValue={formData.fullName || ""} onBlur={(e) => handleInputChange("fullName", e.target.value)} placeholder="e.g., John Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium">Gender *</label>
          <select className={`w-full border rounded-md px-3 py-2 ${invalidFields.includes("gender") ? "border-red-500" : "border-gray-300"}`} value={formData.gender || ""} onChange={(e) => handleInputChange("gender", e.target.value)}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Date of Birth *</label>
          <input type="date" autoComplete="off" className={`w-full border rounded-md px-3 py-2 ${invalidFields.includes("dob") ? "border-red-500" : "border-gray-300"}`} defaultValue={formData.dob || ""} onChange={(e) => handleInputChange("dob", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Highest Qualification *</label>
          <input autoComplete="off" className={`w-full border rounded-md px-3 py-2 ${invalidFields.includes("highestQualification") ? "border-red-500" : "border-gray-300"}`} defaultValue={formData.highestQualification || ""} onBlur={(e) => handleInputChange("highestQualification", e.target.value)} placeholder="e.g., Masters in Education" />
        </div>
        <div>
          <label className="block text-sm font-medium">Coordination Experience (years) *</label>
          <input type="number" min={0} autoComplete="off" className={`w-full border rounded-md px-3 py-2 ${invalidFields.includes("coordinationExperience") ? "border-red-500" : "border-gray-300"}`} defaultValue={formData.coordinationExperience ?? ""} onBlur={(e) => handleInputChange("coordinationExperience", e.target.value)} placeholder="e.g., 3" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Previous School/Organization Name</label>
          <input autoComplete="off" className="w-full border rounded-md px-3 py-2 border-gray-300" defaultValue={formData.previousOrganization || ""} onBlur={(e) => handleInputChange("previousOrganization", e.target.value)} placeholder="Optional" />
        </div>
      </div>
    </div>
  )

  const StepTwo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Email *</label>
          <input type="email" autoComplete="off" className={`w-full border rounded-md px-3 py-2 ${invalidFields.includes("email") ? "border-red-500" : "border-gray-300"}`} defaultValue={formData.email || ""} onBlur={(e) => handleInputChange("email", e.target.value)} placeholder="name@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone *</label>
          <input autoComplete="off" className={`w-full border rounded-md px-3 py-2 ${invalidFields.includes("phone") ? "border-red-500" : "border-gray-300"}`} defaultValue={formData.phone || ""} onBlur={(e) => handleInputChange("phone", e.target.value)} placeholder="03xx-xxxxxxx" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Permanent Address *</label>
          <textarea autoComplete="off" className={`w-full border rounded-md px-3 py-2 ${invalidFields.includes("permanentAddress") ? "border-red-500" : "border-gray-300"}`} defaultValue={formData.permanentAddress || ""} onBlur={(e) => handleInputChange("permanentAddress", e.target.value)} placeholder="Street, City" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">CNIC *</label>
          <input autoComplete="off" className={`w-full border rounded-md px-3 py-2 ${invalidFields.includes("cnic") ? "border-red-500" : "border-gray-300"}`} defaultValue={formData.cnic || ""} onBlur={(e) => handleInputChange("cnic", e.target.value)} placeholder="xxxxx-xxxxxxx-x" />
        </div>
      </div>
    </div>
  )

  const StepThree = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Campus *</label>
          <select className={`w-full border rounded-md px-3 py-2 ${invalidFields.includes("campus") ? "border-red-500" : "border-gray-300"}`} value={formData.campus || ""} onChange={(e) => handleInputChange("campus", e.target.value)}>
            <option value="">Select Campus</option>
            {campusOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Shift *</label>
          <select className={`w-full border rounded-md px-3 py-2 ${invalidFields.includes("shift") ? "border-red-500" : "border-gray-300"}`} value={formData.shift || ""} onChange={(e) => handleInputChange("shift", e.target.value)}>
            <option value="">Select</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Preferred Department / Section</label>
          <select className="w-full border rounded-md px-3 py-2" value={formData.preferredDepartment || ""} onChange={(e) => handleInputChange("preferredDepartment", e.target.value)}>
            <option value="">Select</option>
            <option value="pre-primary">Pre-Primary</option>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Employment Type</label>
          <select className="w-full border rounded-md px-3 py-2" value={formData.employmentType || ""} onChange={(e) => handleInputChange("employmentType", e.target.value)}>
            <option value="">Select</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Joining Date</label>
          <input type="date" className="w-full border rounded-md px-3 py-2 border-gray-300" value={formData.joiningDate || ""} onChange={(e) => handleInputChange("joiningDate", e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Grades under Coordinator</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {gradeOptions.map((g) => (
              <label key={g} className="inline-flex items-center gap-2 border rounded-md px-3 py-1 bg-white">
                <input type="checkbox" checked={Array.isArray(formData.grades) ? formData.grades.includes(g) : false} onChange={() => handleToggleInArray("grades", g)} />
                <span className="text-sm">{g}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Sections (A–E)</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {sectionOptions.map((s) => (
              <label key={s} className="inline-flex items-center gap-2 border rounded-md px-3 py-1 bg-white">
                <input type="checkbox" checked={Array.isArray(formData.sections) ? formData.sections.includes(s) : false} onChange={() => handleToggleInArray("sections", s)} />
                <span className="text-sm">{s}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Teachers under Coordinator (multi-select)</label>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="col-span-1 md:col-span-1">
              <label className="block text-xs text-gray-600 mb-1">Category</label>
              <select className="w-full border rounded-md px-3 py-2" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="pre-primary">Pre-Primary</option>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </select>
            </div>
          </div>
          <div className="mt-2 min-h-10 rounded-md border border-gray-200 bg-white p-2 flex flex-wrap gap-2">
            {selectedTeachers.length === 0 ? (
              <span className="text-sm text-gray-500">No teachers selected</span>
            ) : (
              selectedTeachers.map((t: any) => {
                const id = getTeacherId(t)
                const label = getTeacherLabel(t)
                return (
                  <span key={id} className="inline-flex items-center gap-2 bg-[#e7ecef] text-[#274c77] px-2 py-1 rounded-full text-xs">
                    <span>{label}</span>
                    <button type="button" className="text-[#274c77] hover:text-red-600" onClick={() => handleToggleInArray("teacherIds", id)}>×</button>
                  </span>
                )
              })
            )}
          </div>
          <div className="mt-2 max-h-56 overflow-auto rounded-md border border-gray-200 bg-white divide-y">
            {visibleTeachers.map((t: any) => {
              const id = getTeacherId(t)
              const label = getTeacherLabel(t)
              const checked = Array.isArray(formData.teacherIds) ? formData.teacherIds.includes(id) : false
              return (
                <label key={id} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <input type="checkbox" checked={checked} onChange={() => handleToggleInArray("teacherIds", id)} />
                  <span>{label}</span>
                </label>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    if (showPreview) {
      return (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-[#274c77] mb-4">Preview Coordinator</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-[#274c77] mb-1">Personal</h4>
              <p><strong>Name:</strong> {formData.fullName || '-'}</p>
              <p><strong>Gender:</strong> {formData.gender || '-'}</p>
              <p><strong>DOB:</strong> {formData.dob || '-'}</p>
              <p><strong>Qualification:</strong> {formData.highestQualification || '-'}</p>
              <p><strong>Experience:</strong> {formData.coordinationExperience || '-'} years</p>
              <p><strong>Previous Org:</strong> {formData.previousOrganization || '-'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-[#274c77] mb-1">Contact</h4>
              <p><strong>Email:</strong> {formData.email || '-'}</p>
              <p><strong>Phone:</strong> {formData.phone || '-'}</p>
              <p><strong>Address:</strong> {formData.permanentAddress || '-'}</p>
              <p><strong>CNIC:</strong> {formData.cnic || '-'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-[#274c77] mb-1">Role</h4>
              <p><strong>Campus:</strong> {formData.campus || '-'}</p>
              <p><strong>Shift:</strong> {formData.shift || '-'}</p>
              <p><strong>Preferred Dept:</strong> {formData.preferredDepartment || '-'}</p>
              <p><strong>Employment Type:</strong> {formData.employmentType || '-'}</p>
              <p><strong>Joining Date:</strong> {formData.joiningDate || '-'}</p>
              <p><strong>Grades:</strong> {(formData.grades || []).join(', ') || '-'}</p>
              <p><strong>Sections:</strong> {(formData.sections || []).join(', ') || '-'}</p>
              <p><strong>Teacher IDs:</strong> {(formData.teacherIds || []).join(', ') || '-'}</p>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={() => setShowPreview(false)}>Back</Button>
          </div>
        </div>
      )
    }

    switch (currentStep) {
      case 1: return <StepOne />
      case 2: return <StepTwo />
      case 3: return <StepThree />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {!showPreview && (
        <Card className="border-2">
          <CardHeader>
            <div className="w-full">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Progress</CardTitle>
                  <CardDescription className="text-sm">Step {currentStep} of {totalSteps}</CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">Add Coordinator</div>
              </div>
              <div className="mt-4">
                <Progress value={(currentStep / totalSteps) * 100} className="h-2 rounded-full" />
                <div className="flex items-center justify-between mt-3 gap-2">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => handleStepChange(step.id)}
                      className={`flex items-center gap-3 text-sm px-2 py-1 rounded-lg transition-all focus:outline-none ${
                        currentStep === step.id
                          ? "bg-primary text-white font-medium"
                          : currentStep > step.id
                            ? "bg-green-50 text-green-700"
                            : "text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                          currentStep === step.id
                            ? "bg-primary text-white"
                            : currentStep > step.id
                              ? "bg-green-500 text-white"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="hidden sm:inline">{step.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {renderCurrentStep()}

      {!showPreview && (
        <div className="flex justify-between">
          <Button onClick={handlePrevious} disabled={currentStep === 1} variant="outline" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button onClick={handleNext} className="flex items-center gap-2">
            {currentStep === totalSteps ? (
              <>
                <Eye className="h-4 w-4" />
                Preview
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export default CoordinatorForm


