"use client";

import { CircleX } from "lucide-react";

import { Button } from "../components/button";

interface ResetFilterProps {
  hasModified: boolean;
  handleReset: () => void;
}

export const ResetFilter = ({ hasModified, handleReset }: ResetFilterProps) => {
  if (!hasModified) return null;

  return (
    <Button variant="destructive" size="sm" onClick={handleReset}>
      <CircleX />
      Clear
    </Button>
  );
};
