"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera } from "lucide-react"

interface CampusHeaderProps {
  campusName: string
  campusStatus: "Active" | "Inactive" | "Temporary Closed"
  tagline?: string
  onImageEdit?: () => void
}

export function CampusHeader({
  campusName,
  campusStatus,
  tagline = "Excellence in Education",
  onImageEdit,
}: CampusHeaderProps) {
  const [imageUrl] = useState("/modern-university-aerial.png")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200"
      case "Inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "Temporary Closed":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="relative w-full h-80 overflow-hidden rounded-lg bg-muted">
      {/* Campus Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${imageUrl})` }}>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Edit Image Button */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-900"
          onClick={onImageEdit}
        >
          <Camera className="h-4 w-4 mr-2" />
          Edit Image
        </Button>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col justify-end h-full p-8">
        <div className="space-y-3">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className={`${getStatusColor(campusStatus)} font-medium`}>
              {campusStatus}
            </Badge>
          </div>

          {/* Campus Name */}
          <h1 className="text-4xl font-bold text-white text-balance leading-tight">{campusName}</h1>

          {/* Tagline */}
          {tagline && <p className="text-lg text-white/90 text-pretty max-w-2xl">{tagline}</p>}
        </div>
      </div>
    </div>
  )
}
