"use client"

import { Loader2 } from "lucide-react"
import React from "react"

interface PrettyLoaderProps {
  label?: string
  subLabel?: string
  className?: string
  variant?: "card" | "embedded"
}

export function PrettyLoader({ label = "Loading...", subLabel, className, variant = "card" }: PrettyLoaderProps) {
  if (variant === "embedded") {
    return (
      <div className={`flex items-center justify-center w-full py-10 ${className || ""}`}>
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full grid place-items-center bg-gradient-to-tr from-[#e7ecef] to-white shadow-inner">
            <Loader2 className="h-6 w-6 text-[#274c77] animate-spin" />
          </div>
          <div className="mt-3 text-center">
            <p className="text-[#274c77] text-base font-semibold tracking-wide">{label}</p>
            {subLabel ? (
              <p className="text-[#8b8c89] text-sm mt-1">{subLabel}</p>
            ) : null}
          </div>
          <div className="mt-3 w-56 space-y-2">
            <div className="h-2 w-full rounded-full bg-[#e7ecef] overflow-hidden">
              <div className="h-2 w-1/3 rounded-full bg-[#6096ba] animate-[progress_1.4s_ease-in-out_infinite]" />
            </div>
            <div className="h-2 w-3/4 rounded-full bg-[#e7ecef] overflow-hidden">
              <div className="h-2 w-1/4 rounded-full bg-[#274c77] animate-[progress_1.6s_ease-in-out_infinite]" />
            </div>
          </div>
          <style jsx>{`
            @keyframes progress {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(50%); }
              100% { transform: translateX(150%); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center min-h-[40vh] p-6 ${className || ""}`}>
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6096ba] via-[#274c77] to-[#a3cef1] blur-xl opacity-30 animate-pulse" />
        <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-[#8b8c89]/30 px-8 py-6 flex flex-col items-center">
          <div className="h-16 w-16 rounded-full grid place-items-center bg-gradient-to-tr from-[#e7ecef] to-white shadow-inner">
            <Loader2 className="h-8 w-8 text-[#274c77] animate-spin" />
          </div>
          <div className="mt-4 text-center">
            <p className="text-[#274c77] text-lg font-semibold tracking-wide">{label}</p>
            {subLabel ? (
              <p className="text-[#8b8c89] text-sm mt-1">{subLabel}</p>
            ) : null}
          </div>
          <div className="mt-4 w-56 space-y-2">
            <div className="h-2 w-full rounded-full bg-[#e7ecef] overflow-hidden">
              <div className="h-2 w-1/3 rounded-full bg-[#6096ba] animate-[progress_1.4s_ease-in-out_infinite]" />
            </div>
            <div className="h-2 w-3/4 rounded-full bg-[#e7ecef] overflow-hidden">
              <div className="h-2 w-1/4 rounded-full bg-[#274c77] animate-[progress_1.6s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(150%); }
        }
      `}</style>
    </div>
  )
}

export default PrettyLoader


