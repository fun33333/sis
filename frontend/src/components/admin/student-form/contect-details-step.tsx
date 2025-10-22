"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StudentFormValidator } from "@/lib/student-validation"

interface ContactDetailsStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: string) => void
}

export function ContactDetailsStep({ formData, invalidFields, onInputChange }: ContactDetailsStepProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    onInputChange(field, value)
    
    // Clear error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    
    // Special handling: if house owned set to true, clear rent
    if (field === 'houseOwned') {
      if (value === 'true') {
        onInputChange('rent', '')
        setFieldErrors(prev => {
          const next = { ...prev }
          delete next['rent']
          return next
        })
      }
    }

    // Real-time validation
    let validation: any = { isValid: true }
    
    switch (field) {
      case 'emergencyContact':
        if (value) {
          validation = StudentFormValidator.validatePhoneNumber(value)
        }
        break
      case 'fatherContact':
        if (value) {
          validation = StudentFormValidator.validatePhoneNumber(value)
        }
        break
      case 'motherContact':
        if (value) {
          validation = StudentFormValidator.validatePhoneNumber(value)
        }
        break
      case 'guardianPhone':
        if (value) {
          validation = StudentFormValidator.validatePhoneNumber(value)
        }
        break
      case 'fatherCNIC':
        if (value) {
          validation = StudentFormValidator.validateCNIC(value)
        }
        break
      case 'motherCNIC':
        if (value) {
          validation = StudentFormValidator.validateCNIC(value)
        }
        break
      case 'guardianCNIC':
        if (value) {
          validation = StudentFormValidator.validateCNIC(value)
        }
        break
      case 'familyIncome':
        if (value) {
          validation = StudentFormValidator.validatePositiveNumber(value, "Family Income")
        }
        break
      case 'rent':
        // Only validate rent when house is not owned
        if (formData.houseOwned === 'false' && value) {
          validation = StudentFormValidator.validatePositiveNumber(value, "Rent Amount")
        }
        break
      case 'address':
        validation = StudentFormValidator.validateAddress(value)
        break
      case 'siblingsCount':
        if (value) {
          validation = StudentFormValidator.validatePositiveInteger(value, "Siblings Count")
        }
        break
    }
    
    if (!validation.isValid) {
      setFieldErrors(prev => ({ ...prev, [field]: validation.message }))
    }
  }

  // When houseOwned is yes/true, clear rent and hide the input
  useEffect(() => {
    const owned = String(formData.houseOwned || "").toLowerCase()
    if (owned === "yes" || owned === "true") {
      if (formData.rent) {
        onInputChange("rent", "")
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.houseOwned])

  const getFieldError = (field: string) => {
    return fieldErrors[field] || (invalidFields.includes(field) ? `${field} is required` : '')
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Contact Details</CardTitle>
        <p className="text-sm text-gray-600">Fields marked with * are required. Phone numbers must be 11 digits starting with 03. CNIC must be 13 digits.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="emergencyContact">Emergency Contact Number *</Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact || ""}
              onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
              className={getFieldError("emergencyContact") ? "border-red-500" : ""}
              placeholder="03XX-XXXXXXX"
              maxLength={11}
            />
            <p className="text-xs text-gray-500 mt-1">Contact must be of father, mother or guardian. Format: 03XX-XXXXXXX</p>
            {getFieldError("emergencyContact") && (
              <p className="text-sm text-red-600 mt-1">{getFieldError("emergencyContact")}</p>
            )}
          </div>

          <div>
            <Label htmlFor="fatherStatus">Father Status</Label>
            <Select value={formData.fatherStatus || ""} onValueChange={(v) => onInputChange("fatherStatus", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("fatherStatus") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alive">Alive</SelectItem>
                <SelectItem value="dead">Dead</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fatherName">Father Name</Label>
            <Input
              id="fatherName"
              value={formData.fatherName || ""}
              onChange={(e) => handleInputChange("fatherName", e.target.value)}
              placeholder="Enter father's full name"
            />
          </div>

          <div>
            <Label htmlFor="fatherCNIC">Father CNIC</Label>
            <Input
              id="fatherCNIC"
              value={formData.fatherCNIC || ""}
              onChange={(e) => handleInputChange("fatherCNIC", e.target.value)}
              className={getFieldError("fatherCNIC") ? "border-red-500" : ""}
              placeholder="XXXXX-XXXXXXX-X"
              maxLength={13}
            />
            {getFieldError("fatherCNIC") && (
              <p className="text-sm text-red-600 mt-1">{getFieldError("fatherCNIC")}</p>
            )}
          </div>

          <div>
            <Label htmlFor="fatherContact">Father Contact Number</Label>
            <Input
              id="fatherContact"
              value={formData.fatherContact || ""}
              onChange={(e) => handleInputChange("fatherContact", e.target.value)}
              className={getFieldError("fatherContact") ? "border-red-500" : ""}
              placeholder="03XX-XXXXXXX"
              maxLength={11}
            />
            {getFieldError("fatherContact") && (
              <p className="text-sm text-red-600 mt-1">{getFieldError("fatherContact")}</p>
            )}
          </div>

          <div>
            <Label htmlFor="fatherProfession">Father Profession</Label>
            <Input
              id="fatherProfession"
              value={formData.fatherProfession || ""}
              onChange={(e) => handleInputChange("fatherProfession", e.target.value)}
              placeholder="Enter profession"
            />
          </div>

          {/* Guardian fields - only show if father status is "dead" */}
          {formData.fatherStatus === "dead" && (
            <>
              <div>
                <Label htmlFor="guardianName">Guardian Name *</Label>
                <Input
                  id="guardianName"
                  value={formData.guardianName || ""}
                  onChange={(e) => handleInputChange("guardianName", e.target.value)}
                  className={getFieldError("guardianName") ? "border-red-500" : ""}
                  placeholder="Enter guardian's full name"
                />
                {getFieldError("guardianName") && (
                  <p className="text-sm text-red-600 mt-1">{getFieldError("guardianName")}</p>
                )}
              </div>

              <div>
                <Label htmlFor="guardianRelation">Guardian's Relation with Student *</Label>
                <Input
                  id="guardianRelation"
                  value={formData.guardianRelation || ""}
                  onChange={(e) => handleInputChange("guardianRelation", e.target.value)}
                  className={getFieldError("guardianRelation") ? "border-red-500" : ""}
                  placeholder="e.g., Uncle, Grandfather"
                />
                {getFieldError("guardianRelation") && (
                  <p className="text-sm text-red-600 mt-1">{getFieldError("guardianRelation")}</p>
                )}
              </div>

              <div>
                <Label htmlFor="guardianCNIC">Guardian CNIC *</Label>
                <Input
                  id="guardianCNIC"
                  value={formData.guardianCNIC || ""}
                  onChange={(e) => handleInputChange("guardianCNIC", e.target.value)}
                  className={getFieldError("guardianCNIC") ? "border-red-500" : ""}
                  placeholder="XXXXX-XXXXXXX-X"
                  maxLength={13}
                />
                {getFieldError("guardianCNIC") && (
                  <p className="text-sm text-red-600 mt-1">{getFieldError("guardianCNIC")}</p>
                )}
              </div>

              <div>
                <Label htmlFor="guardianPhone">Guardian Phone Number *</Label>
                <Input
                  id="guardianPhone"
                  value={formData.guardianPhone || ""}
                  onChange={(e) => handleInputChange("guardianPhone", e.target.value)}
                  className={getFieldError("guardianPhone") ? "border-red-500" : ""}
                  placeholder="03XX-XXXXXXX"
                  maxLength={11}
                />
                {getFieldError("guardianPhone") && (
                  <p className="text-sm text-red-600 mt-1">{getFieldError("guardianPhone")}</p>
                )}
              </div>

              <div>
                <Label htmlFor="guardianProfession">Guardian Profession *</Label>
                <Input
                  id="guardianProfession"
                  value={formData.guardianProfession || ""}
                  onChange={(e) => handleInputChange("guardianProfession", e.target.value)}
                  className={getFieldError("guardianProfession") ? "border-red-500" : ""}
                  placeholder="Enter profession"
                />
                {getFieldError("guardianProfession") && (
                  <p className="text-sm text-red-600 mt-1">{getFieldError("guardianProfession")}</p>
                )}
              </div>
            </>
          )}

          <div>
            <Label htmlFor="motherName">Mother Name</Label>
            <Input
              id="motherName"
              value={formData.motherName || ""}
              onChange={(e) => handleInputChange("motherName", e.target.value)}
              placeholder="Enter mother's full name"
            />
          </div>

          <div>
            <Label htmlFor="siblingInAlkhair">Siblings in Al-Khair</Label>
            <Select value={formData.siblingInAlkhair || ""} onValueChange={(v) => onInputChange("siblingInAlkhair", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("siblingInAlkhair") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Siblings count field - only show if sibling in alkhair is "yes" */}
          {formData.siblingInAlkhair === "yes" && (
            <div>
              <Label htmlFor="siblingsCount">Count of Siblings *</Label>
              <Input
                id="siblingsCount"
                type="number"
                min="1"
                value={formData.siblingsCount || ""}
                onChange={(e) => handleInputChange("siblingsCount", e.target.value)}
                className={getFieldError("siblingsCount") ? "border-red-500" : ""}
                placeholder="Enter number of siblings"
              />
              {getFieldError("siblingsCount") && (
                <p className="text-sm text-red-600 mt-1">{getFieldError("siblingsCount")}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="motherCNIC">Mother CNIC</Label>
            <Input
              id="motherCNIC"
              value={formData.motherCNIC || ""}
              onChange={(e) => handleInputChange("motherCNIC", e.target.value)}
              className={getFieldError("motherCNIC") ? "border-red-500" : ""}
              placeholder="XXXXX-XXXXXXX-X"
              maxLength={13}
            />
            {getFieldError("motherCNIC") && (
              <p className="text-sm text-red-600 mt-1">{getFieldError("motherCNIC")}</p>
            )}
          </div>

          <div>
            <Label htmlFor="motherStatus">Mother Status</Label>
            <Select value={formData.motherStatus || ""} onValueChange={(v) => onInputChange("motherStatus", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("motherStatus") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="widowed">Widowed</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="married">Married</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="motherContact">Mother Contact Number</Label>
            <Input
              id="motherContact"
              value={formData.motherContact || ""}
              onChange={(e) => handleInputChange("motherContact", e.target.value)}
              className={getFieldError("motherContact") ? "border-red-500" : ""}
              placeholder="03XX-XXXXXXX"
              maxLength={11}
            />
            {getFieldError("motherContact") && (
              <p className="text-sm text-red-600 mt-1">{getFieldError("motherContact")}</p>
            )}
          </div>

          <div>
            <Label htmlFor="motherProfession">Mother Profession</Label>
            <Input
              id="motherProfession"
              value={formData.motherProfession || ""}
              onChange={(e) => handleInputChange("motherProfession", e.target.value)}
              placeholder="Enter profession"
            />
          </div>

          <div>
            <Label htmlFor="zakatStatus">Zakat Status</Label>
            <Select value={formData.zakatStatus || ""} onValueChange={(v) => onInputChange("zakatStatus", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("zakatStatus") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select zakat status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="applicable">Applicable</SelectItem>
                <SelectItem value="not_applicable">Not Applicable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="familyIncome">Family Income (PKR)</Label>
            <Input
              id="familyIncome"
              type="number"
              min="0"
              step="0.01"
              value={formData.familyIncome || ""}
              onChange={(e) => handleInputChange("familyIncome", e.target.value)}
              className={getFieldError("familyIncome") ? "border-red-500" : ""}
              placeholder="Enter monthly income"
            />
            {getFieldError("familyIncome") && (
              <p className="text-sm text-red-600 mt-1">{getFieldError("familyIncome")}</p>
            )}
          </div>

          <div>
            <Label htmlFor="houseOwned">House Owned</Label>
            <Select value={formData.houseOwned || ""} onValueChange={(v) => onInputChange("houseOwned", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("houseOwned") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(String(formData.houseOwned || "").toLowerCase() === "no" || String(formData.houseOwned || "").toLowerCase() === "false") && (
            <div>
              <Label htmlFor="rent">Rent Amount (PKR)</Label>
              <Input
                id="rent"
                type="number"
                min="0"
                step="0.01"
                value={formData.rent || ""}
                onChange={(e) => handleInputChange("rent", e.target.value)}
                className={getFieldError("rent") ? "border-red-500" : ""}
                placeholder="Enter monthly rent"
              />
              {getFieldError("rent") && (
                <p className="text-sm text-red-600 mt-1">{getFieldError("rent")}</p>
              )}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address || ""}
            onChange={(e) => handleInputChange("address", e.target.value)}
            className={getFieldError("address") ? "border-red-500" : ""}
            placeholder="Enter complete address"
            rows={3}
          />
          {getFieldError("address") && (
            <p className="text-sm text-red-600 mt-1">{getFieldError("address")}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}