"use client"

import { useState, useEffect } from "react"
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
import { ClientFormSteps } from "./client-form-steps"
import { toast } from "sonner"

// Define ClientFormValues type based on the simplified schema in client-form-steps.tsx
type ClientFormValues = {
  name: string;
  email?: string;
  phone?: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
}

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
  useEffect(() => {
    fetchClients()
  }, [])

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
        isValid = await form.trigger(["title", "startDate", "endDate"])
        break
      case 1: // Client
        isValid = await form.trigger(["clientId"])
        break
      case 2: // Location
        isValid = await form.trigger(["location"])
        // Also validate pricing fields before allowing to proceed to pricing step
        if (isValid) {
          isValid = await form.trigger(["status", "pricingType"])
          // Only validate fixedPrice if pricingType is FIXED_PRICE
          if (form.getValues("pricingType") === "FIXED_PRICE") {
            isValid = await form.trigger(["fixedPrice"])
          }
        }
        break
      case 3: // Pricing
        isValid = await form.trigger(["status", "pricingType", "notes"])
        // Only validate fixedPrice if pricingType is FIXED_PRICE
        if (isValid && form.getValues("pricingType") === "FIXED_PRICE") {
          isValid = await form.trigger(["fixedPrice"])
        }
        break
      default:
        isValid = false
    }

    if (!isValid) {
      // Show a toast message to inform the user about validation errors
      toast.error("Please fill in all required fields before proceeding")
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
    // Validate all fields before submitting
    const isValid = await form.trigger()

    if (!isValid) {
      toast.error("Please fill in all required fields before submitting")
      return
    }

    setIsSubmitting(true)
    try {
      // If pricing type is not FIXED_PRICE, ensure fixedPrice is 0
      if (values.pricingType !== "FIXED_PRICE") {
        values.fixedPrice = 0
      }

      await onSubmit(values)
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("An error occurred while submitting the form")
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

      {/* Client Dialog - Only shown when the user clicks the "+" button */}
      {showClientDialog && (
        <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
          <ClientFormSteps
            onSubmit={handleAddClient}
            onCancel={() => setShowClientDialog(false)}
            isEditMode={false}
          />
        </Dialog>
      )}
    </div>
  )
}
