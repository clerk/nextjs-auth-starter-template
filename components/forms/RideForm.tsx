// src/components/RideForm.tsx

"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useForm, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";

// Import types, constants, utils
import { rideFormSchema } from "@/components/forms/ride-form/schemas/ride-schema";
import { DEFAULT_DURATION, MISSION_RIDE_CATEGORIES } from "@/components/forms/ride-form/constants";
import {
    RideFormValues, RideFormProps,
    User,
    StepProps
} from "@/components/forms/ride-form/types";
import type { PassengerFormValues } from "@/components/forms/ride-form/schemas/passenger-schema";
import { getDefaultRideValues, getDefaultMissionValues } from "@/components/forms/ride-form/types/rideFormUtils";

// Import Steps
import { PassengerStep } from '@/components/forms/ride-form/ride-form-steps/PassengerStep';
import { RideDetailsStep } from '@/components/forms/ride-form/ride-form-steps/RideDetailsStep';
import { MilestonesStep } from '@/components/forms/ride-form/ride-form-steps/MilestonesStep';
import { MissionStep } from '@/components/forms/ride-form/ride-form-steps/MissionStep';
import { ReviewStep } from '@/components/forms/ride-form/ride-form-steps/ReviewStep';


export function RideForm({
  onAddRide,
  users = [],
  chauffeurs = [],
  clients = [],
  partners = [],
  projects = [],
  existingMissions = [],
  defaultValues: initialDefaultValues, // Renamed to avoid conflict
  buttonText = "Add Ride",
  showMissionButton = true, // Keep this prop if explicitly needed outside mission context
}: RideFormProps) {

  const form = useForm({
    resolver: zodResolver(rideFormSchema),
    defaultValues: getDefaultRideValues(initialDefaultValues),
    mode: 'onChange', // Validate on change for better UX
  });

    const { control, handleSubmit, watch, setValue, getValues, reset, trigger } = form;

    const isMission = watch("isMission");
    const selectedPassengerId = watch("passengerId");

    // --- Multi-Step Logic ---
    const [currentStep, setCurrentStep] = useState(0);

    const steps = useMemo(() => [
        { id: "passenger", label: "Passenger", fields: ['passengerId', 'passengerInfo', 'useExistingPassenger'] as Path<RideFormValues>[] },
        { id: "ride-details", label: "Ride Details", fields: ['pickupAddress', 'dropoffAddress', 'pickupTime', 'category', 'status', 'fare', 'notes'] as Path<RideFormValues>[] },
        ...(!isMission ? [{ id: "milestones", label: "Milestones", fields: ['milestones'] as Path<RideFormValues>[] }] : []),
        ...(isMission ? [{ id: "mission", label: "Mission", fields: ['mission'] as Path<RideFormValues>[] }] : []),
        { id: "review", label: "Review", fields: [] as Path<RideFormValues>[] },
    ], [isMission]);

    const nextStep = useCallback(() => {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, [steps.length]);

    const prevStep = useCallback(() => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    }, []);

    const validateStep = useCallback(async (stepIndex: number): Promise<boolean> => {
        const step = steps[stepIndex];
        if (!step || !step.fields || step.fields.length === 0) {
            return true;
        }
        console.log("Validating fields for step:", step.id, step.fields);
        const result = await trigger(step.fields);
        console.log("Validation result:", result);
        return result;
    }, [trigger, steps]);

    const handleNext = useCallback(async () => {
        const isValid = await validateStep(currentStep);
        if (isValid) {
            nextStep();
        } else {
            console.log("Step validation failed", form.formState.errors);
        }
    }, [currentStep, validateStep, nextStep, form.formState.errors]);


    // --- Mission Handling ---
    const chauffeurHasExistingMission = useCallback((chauffeurId: string): boolean => {
        return existingMissions.some(mission => mission.chauffeurId === chauffeurId);
    }, [existingMissions]);

    const createNewMissionForChauffeur = useCallback(() => {
        const passenger = users.find(user => user.id === selectedPassengerId);
        const missionTitle = passenger ? `Mission for ${passenger.name}` : "New Mission";
        const currentMissionValues = getValues("mission") || {};
        const chauffeurId = getValues("mission.chauffeurId");

        setValue("isMission", true, { shouldValidate: true });
        setValue("mission", {
            ...getDefaultMissionValues(),
            ...currentMissionValues,
            chauffeurId: chauffeurId || undefined,
            title: missionTitle,
            clientId: selectedPassengerId || "", // Add required clientId field
            status: "SCHEDULED",
            passengerIds: selectedPassengerId ? [selectedPassengerId] : [],
            startDate: new Date(), // Ensure proper Date object
            endDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Ensure proper Date object
            duration: DEFAULT_DURATION,
            isExternalPartner: false,
            notes: "",
        }, { shouldValidate: true });

        const missionStepIndex = steps.findIndex(step => step.id === 'mission');
        if (missionStepIndex !== -1 && currentStep < missionStepIndex) {
            setCurrentStep(missionStepIndex);
        }

    }, [setValue, getValues, selectedPassengerId, users, steps, currentStep]);


    // --- Form Submission ---
    const processAndSubmit = useCallback((data: RideFormValues) => {
        console.log("Form data submitted:", data);
        let finalData = { ...data };
        const potentialChauffeurId = data.mission?.chauffeurId;

        if (!finalData.isMission && potentialChauffeurId && !chauffeurHasExistingMission(potentialChauffeurId)) {
            console.log("Auto-creating mission for chauffeur:", potentialChauffeurId);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const chauffeur = chauffeurs.find(c => c.id === potentialChauffeurId);
            const chauffeurName = chauffeur ? chauffeur.name : 'Selected Chauffeur';
            const passenger = finalData.useExistingPassenger
                ? users.find(u => u.id === finalData.passengerId)
                : finalData.passengerInfo;
            const passengerName = finalData.useExistingPassenger
                ? (passenger as User)?.name || 'Selected Passenger'
                : `${(passenger as PassengerFormValues)?.firstName} ${(passenger as PassengerFormValues)?.lastName}` || 'New Passenger';

            finalData.isMission = true;
            finalData.mission = {
                ...getDefaultMissionValues(),
                ...(finalData.mission || {}),
                title: `Mission for ${passengerName} with ${chauffeurName}`,
                status: "SCHEDULED",
                clientId: finalData.passengerId || clients[0]?.id || "",
                chauffeurId: potentialChauffeurId,
                passengerIds: finalData.passengerId ? [finalData.passengerId] : [],
                startDate: today,
                endDate: tomorrow,
                isExternalPartner: false, // Explicitly set required boolean
                duration: DEFAULT_DURATION,
                rides: [{
                    pickupAddress: finalData.pickupAddress,
                    dropoffAddress: finalData.dropoffAddress,
                    pickupTime: finalData.pickupTime,
                    category: MISSION_RIDE_CATEGORIES.includes(finalData.category as any) ? finalData.category as typeof MISSION_RIDE_CATEGORIES[number] : 'CITY_TRANSFER',
                    status: "SCHEDULED",
                    milestones: finalData.milestones || [],
                    notes: finalData.notes || "",
                    fare: finalData.fare,
                }],
            };
            // Clear non-mission fields
            finalData.pickupAddress = "";
            finalData.dropoffAddress = "";
            finalData.category = "CITY_TRANSFER";
            finalData.status = "SCHEDULED";
            finalData.notes = "";
            finalData.fare = undefined;
            finalData.milestones = [];
        }

        onAddRide(finalData);
        reset(getDefaultRideValues(initialDefaultValues));
        setCurrentStep(0);
    }, [onAddRide, reset, chauffeurs, users, clients, initialDefaultValues, chauffeurHasExistingMission]);

    // --- Render Logic ---
    const renderStepContent = () => {
        const stepId = steps[currentStep]?.id;
        const stepProps = {
            form,
            users,
            chauffeurs,
            clients,
            partners,
            projects,
            existingMissions,
        };

        switch (stepId) {
            case 'passenger': return <PassengerStep {...stepProps as Required<StepProps>} />;
            case 'ride-details': return <RideDetailsStep {...stepProps as Required<StepProps>} isMission={Boolean(isMission)} />;
            case 'milestones': return !isMission ? <MilestonesStep {...stepProps as Required<StepProps>} /> : null;
            case 'mission': return isMission ? <MissionStep {...stepProps as Required<StepProps>} /> : null;
            case 'review': return <ReviewStep {...stepProps as Required<StepProps>} isMission={Boolean(isMission)} />;
            default: return <div>Unknown step</div>;
        }
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={handleSubmit(processAndSubmit)} className="space-y-6">
                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            {steps.map((step, index) => (
                                <div key={step.id} className={`text-xs font-medium ${index <= currentStep ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {step.label}
                                </div>
                            ))}
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-300 ease-in-out" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="min-h-[400px]">{renderStepContent()}</div>

                    {/* Conditional "Create Mission" button */}
                    {(currentStep === 0 || currentStep === 1) && showMissionButton && !isMission && getValues("mission.chauffeurId") && (
                        <div className="flex justify-end pt-2">
                            <Button type="button" variant="outline" onClick={createNewMissionForChauffeur}>
                                Create Mission for Chauffeur
                            </Button>
                        </div>
                    )}

                    {/* Mission Toggle */}
                    {currentStep !== steps.length - 1 && (
                        <FormField
                            control={control}
                            name="isMission"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Mission Mode</FormLabel>
                                        <FormDescription>Enable for multi-day/multi-ride assignments.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-6 border-t">
                        {currentStep > 0 ? (
                            <Button type="button" variant="outline" onClick={prevStep}>
                                <ChevronLeftIcon className="mr-2 h-4 w-4" /> Previous
                            </Button>
                        ) : <div />}

                        {currentStep < steps.length - 1 ? (
                            <Button type="button" onClick={handleNext}>
                                Next <ChevronRightIcon className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button type="submit">{buttonText}</Button>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    );
}
