"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { clientSchema } from "@/app/clients/schemas/client-schema"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Loader2, ArrowLeft, ArrowRight, Check, Building2, User, MapPin, FileText } from "lucide-react"
import { Progress } from "@/components/ui/progress"

// Step components
import { ClientBasicInfoStep } from "./client-form/basic-info-step"
import { ClientContactStep } from "./client-form/contact-step"
import { ClientAddressStep } from "./client-form/address-step"
import { ClientContractStep } from "./client-form/contract-step"

type ClientFormValues = z.infer<typeof clientSchema>

interface ClientFormStepsProps {
  defaultValues?: Partial<ClientFormValues>
  onSubmit: (values: ClientFormValues) => Promise<void>
  onCancel: () => void
  isEditMode?: boolean
}

export function ClientFormSteps({
  defaultValues,
  onSubmit,
  onCancel,
  isEditMode = false,
}: ClientFormStepsProps) {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: defaultValues || {
      name: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      contactFirstName: "",
      contactLastName: "",
      contactEmail: "",
      contactPhone: "",
      contractStart: "",
      contractEnd: "",
      active: true,
      sendInvitation: true,
    },
    mode: "onChange",
  })

  const steps = [
    { title: "Basic Info", icon: <Building2 className="h-4 w-4" /> },
    { title: "Contact", icon: <User className="h-4 w-4" /> },
    { title: "Address", icon: <MapPin className="h-4 w-4" /> },
    { title: "Contract", icon: <FileText className="h-4 w-4" /> },
  ]

  const totalSteps = steps.length
  const progress = ((step + 1) / totalSteps) * 100

  const validateCurrentStep = async () => {
    let isValid = false
    
    switch (step) {
      case 0: // Basic Info
        isValid = await form.trigger(["name", "email", "phone", "website"])
        break
      case 1: // Contact
        isValid = await form.trigger(["contactFirstName", "contactLastName", "contactEmail", "contactPhone", "sendInvitation"])
        break
      case 2: // Address
        isValid = await form.trigger(["address", "city", "postalCode", "country"])
        break
      case 3: // Contract
        isValid = await form.trigger(["contractStart", "contractEnd", "active"])
        break
      default:
        isValid = false
    }
    
    return isValid
  }

  const handleNext = async () => {
    const isValid = await validateCurrentStep()
    if (isValid && step < totalSteps - 1) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async (values: ClientFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between">
          {steps.map((s, i) => (
            <div 
              key={i} 
              className={`flex items-center ${i <= step ? "text-primary" : "text-muted-foreground"}`}
            >
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 
                  ${i < step ? "bg-primary text-primary-foreground" : 
                    i === step ? "border-2 border-primary" : "border-2 border-muted"}`}
              >
                {i < step ? <Check className="h-4 w-4" /> : s.icon}
              </div>
              <span className="text-sm hidden sm:inline">{s.title}</span>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {step === 0 && <ClientBasicInfoStep form={form} />}
          {step === 1 && <ClientContactStep form={form} isEditMode={isEditMode} />}
          {step === 2 && <ClientAddressStep form={form} />}
          {step === 3 && <ClientContractStep form={form} />}

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={step === 0 ? onCancel : handleBack}
              disabled={isSubmitting}
            >
              {step === 0 ? (
                "Cancel"
              ) : (
                <>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </>
              )}
            </Button>
            
            {step < totalSteps - 1 ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditMode ? "Update Client" : "Create Client"
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
