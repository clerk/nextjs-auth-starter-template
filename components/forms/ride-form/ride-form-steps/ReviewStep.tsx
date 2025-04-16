// src/components/ride-form-steps/ReviewStep.tsx

"use client";

import React from 'react';
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import type { StepProps, User } from '../types';
import type { PassengerFormValues } from '../schemas/passenger-schema';
import { MISSION_RIDE_CATEGORIES } from '../constants';
import { getRideCategoryLabel, getMissionRideCategoryLabel } from '../types/rideFormUtils';

interface ReviewStepProps extends StepProps {
    isMission: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ form, users = [], chauffeurs = [], clients = [], partners = [], isMission }) => {
    const values = form.getValues();
    const passenger = values.useExistingPassenger ? users.find(u => u.id === values.passengerId) : values.passengerInfo;
    const client = clients.find(c => c.id === values.mission?.clientId);
    const partner = partners.find(p => p.id === values.mission?.partnerId);
    const chauffeur = chauffeurs.find(c => c.id === values.mission?.chauffeurId);

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium">Review Details</h3>
            <Card>
                <CardContent className="pt-6 space-y-3">
                    <h4 className="font-semibold">Passenger</h4>
                    {passenger ? (
                        <>
                            <p><span className="font-medium">Name:</span> {values.useExistingPassenger ? (passenger as User)?.name : `${(passenger as PassengerFormValues)?.firstName} ${(passenger as PassengerFormValues)?.lastName}`}</p>
                            {!values.useExistingPassenger && <p><span className="font-medium">Phone:</span> {(passenger as PassengerFormValues)?.phoneNumber || 'N/A'}</p>}
                            {!values.useExistingPassenger && <p><span className="font-medium">Count:</span> {(passenger as PassengerFormValues)?.passengerCount}</p>}
                        </>
                    ) : <p className="text-muted-foreground">No passenger selected/entered.</p>}
                </CardContent>
            </Card>

            {!isMission ? (
                <Card>
                    <CardContent className="pt-6 space-y-3">
                        <h4 className="font-semibold">Ride Details</h4>
                        <p><span className="font-medium">Type:</span> {getRideCategoryLabel(values.category)}</p>
                        <p><span className="font-medium">Pickup:</span> {values.pickupAddress}</p>
                        <p><span className="font-medium">Dropoff:</span> {values.dropoffAddress}</p>
                        <p><span className="font-medium">Time:</span> {values.pickupTime ? format(values.pickupTime, "PPP HH:mm") : 'N/A'}</p>
                        <p><span className="font-medium">Status:</span> {values.status}</p>
                        {values.fare != null && <p><span className="font-medium">Fare:</span> ${values.fare.toFixed(2)}</p>}
                        {values.notes && <p><span className="font-medium">Notes:</span> {values.notes}</p>}
                        {values.milestones && values.milestones.length > 0 && (
                            <div>
                                <h5 className="font-medium mt-2">Milestones:</h5>
                                <ul className="list-disc pl-5 text-sm">
                                    {values.milestones.map((m, i) => <li key={i}>{m.type}: {m.address} {m.time ? `(${format(m.time, "HH:mm")})` : ''}</li>)}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="pt-6 space-y-3">
                        <h4 className="font-semibold">Mission Details</h4>
                        <p><span className="font-medium">Title:</span> {values.mission?.title || 'N/A'}</p>
                        <p><span className="font-medium">Client:</span> {client?.name || 'N/A'}</p>
                        {values.mission?.isExternalPartner ? (
                            <p><span className="font-medium">Partner:</span> {partner?.name || 'N/A'}</p>
                        ) : (
                            <p><span className="font-medium">Chauffeur:</span> {chauffeur?.name || 'N/A'}</p>
                        )}
                        <p><span className="font-medium">Dates:</span> {values.mission?.startDate ? format(values.mission.startDate, "PPP") : 'N/A'} - {values.mission?.endDate ? format(values.mission.endDate, "PPP") : 'N/A'}</p>
                        <p><span className="font-medium">Duration:</span> {values.mission?.duration} hours</p>
                        {values.mission?.totalBudget != null && <p><span className="font-medium">Budget:</span> ${values.mission.totalBudget.toFixed(2)}</p>}
                        {values.mission?.isExternalPartner && values.mission?.partnerFee != null && <p><span className="font-medium">Partner Fee:</span> ${values.mission.partnerFee.toFixed(2)}</p>}

                        {values.mission?.rides && values.mission.rides.length > 0 && (
                            <div>
                                <h5 className="font-medium mt-2">Rides:</h5>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                    {values.mission.rides.map((r, i) => (
                                        <li key={r.id || i}>
                                            {getMissionRideCategoryLabel(r.category)} from {r.pickupAddress} to {r.dropoffAddress} at {r.pickupTime ? format(r.pickupTime, "PP HH:mm") : 'N/A'}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {values.mission?.notes && <p><span className="font-medium mt-2 block">Mission Notes:</span> {values.mission.notes}</p>}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
