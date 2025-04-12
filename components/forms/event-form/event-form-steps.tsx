"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { eventFormSchema } from "./schemas/event-schema"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Loader2, ArrowLeft, ArrowRight, Check, Calendar, Building2, MapPin, FileText } from "lucide-react"
import { Progress } from "@/components/ui/progress"

// Step components
import { EventBasicInfoStep } from "./steps/basic-info-step"
import { EventClientStep } from "./steps/client-step"
import { EventLocationStep } from "./steps/location-step"
import { EventPricingStep } from "./steps/pricing-step"

import type { EventFormValues } from "./types"
import { Dialog } from "@/components/ui/dialog"
import { ClientFormSteps } from "@/components/client-form-steps"
import { ClientFormValues } from "@/app/clients/schemas/client-schema"
import { toast } from "sonner"

interface EventFormStepsProps {
  defaultValues?: Partial<EventFormValues>
  onSubmit: (values: EventFormValues) => Promise<void>
  onCancel: () => void
  isEditMode?: boolean
}

export function EventFormSteps({
  defaultValues,
  onSubmit,
  onCancel,
  isEditMode = false,
}: EventFormStepsProps) {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showClientDialog, setShowClientDialog] = useState(false)
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState(true)

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: defaultValues || {
      title: "",
      description: "",
      clientId: "",
      startDate: new Date(),
      endDate: new Date(),
      location: "",
      status: "PLANNED",
      pricingType: "MISSION_BASED",
      fixedPrice: 0,
      notes: "",
    },
    mode: "onChange",
  })

  // Fetch clients for the dropdown
  const fetchClients = async () => {
    setIsLoadingClients(true)
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data.map((client: any) => ({
          id: client.id,
          name: client.name
        })))
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setIsLoadingClients(false)
    }
  }

  // Fetch clients on component mount
  useState(() => {
    fetchClients()
  })

  const steps = [
    { title: "Basic Info", icon: <Calendar className="h-4 w-4" /> },
    { title: "Client", icon: <Building2 className="h-4 w-4" /> },
    { title: "Location", icon: <MapPin className="h-4 w-4" /> },
    { title: "Pricing", icon: <FileText className="h-4 w-4" /> },
  ]

  const totalSteps = steps.length
  const progress = ((step + 1) / totalSteps) * 100

  const validateCurrentStep = async () => {
    let isValid = false
    
    switch (step) {
      case 0: // Basic Info
        isValid = await form.trigger(["title", "description", "startDate", "endDate"])
        break
      case 1: // Client
        isValid = await form.trigger(["clientId"])
        break
      case 2: // Location
        isValid = await form.trigger(["location"])
        break
      case 3: // Pricing
        isValid = await form.trigger(["status", "pricingType", "fixedPrice", "notes"])
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

  const handleSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddClient = async (data: ClientFormValues) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const newClient = await response.json()
        
        // Update clients list
        await fetchClients()
        
        // Set the new client as selected
        form.setValue('clientId', newClient.id)
        
        toast.success("Client created successfully")
        setShowClientDialog(false)
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to create client")
      }
    } catch (error) {
      console.error("Error creating client:", error)
      toast.error("An error occurred while creating the client")
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
          {step === 0 && <EventBasicInfoStep form={form} />}
          {step === 1 && (
            <EventClientStep 
              form={form} 
              clients={clients} 
              isLoading={isLoadingClients} 
              onAddClient={() => setShowClientDialog(true)} 
            />
          )}
          {step === 2 && <EventLocationStep form={form} />}
          {step === 3 && <EventPricingStep form={form} />}

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
                    {isEditMode ? "Updating..." : "Create Event"}
                  </>
                ) : (
                  isEditMode ? "Update Event" : "Create Event"
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>

      {/* Client Dialog */}
      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <ClientFormSteps
          onSubmit={handleAddClient}
          onCancel={() => setShowClientDialog(false)}
          isEditMode={false}
        />
      </Dialog>
    </div>
  )
}
