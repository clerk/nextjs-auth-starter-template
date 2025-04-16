"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { PremierSeasonForm } from "./premier-season-form"
import type { PremierSeason } from "@/types/premier-season"

interface PremierSeasonDialogProps {
  season?: PremierSeason
  mode: "create" | "edit"
  trigger?: React.ReactNode
  onSubmit: (data: PremierSeason) => void
}

export function PremierSeasonDialog({ 
  season, 
  mode, 
  trigger, 
  onSubmit 
}: PremierSeasonDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Premier Season
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Premier Season" : "Edit Premier Season"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Create a new premier season for high-profile events" 
              : "Edit the details of this premier season"}
          </DialogDescription>
        </DialogHeader>
        <PremierSeasonForm 
          initialData={season} 
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}