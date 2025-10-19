"use client";

import { useBatchTransfer } from "@/hooks/use-student";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";

import { useGetStudents } from "../../filters/use-get-students";

export const BatchTransferModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");

  const { isOpen, studentId, onClose, batchName, classNameId, batchId } =
    useBatchTransfer();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [filters] = useGetStudents();

  const { data } = useQuery(
    trpc.batch.getForBatchTransfer.queryOptions({ classNameId, batchId })
  );

  const { mutate: transferBatch, isPending } = useMutation(
    trpc.student.batchTransfer.mutationOptions({
      onError: (err) => {
        setErrorText(err.message);
        setButtonState("error");
        toast.error(err.message);
      },
      onSuccess: async (data) => {
        if (!data.success) {
          setButtonState("error");
          setErrorText(data.message);
          toast.error(data.message);
          return;
        }
        setButtonState("success");
        toast.success(data.message);
        queryClient.invalidateQueries(
          trpc.student.getMany.queryOptions({ ...filters })
        );
        onClose();
      },
    })
  );

  const handleTransfer = () => {
    setButtonState("loading");
    transferBatch({ studentId, batchId: selectedBatchId });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Batch Transfer</DialogTitle>
          <DialogDescription>
            Transfer student one batch to another
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {batchId && (
            <div className="border-l-4 border-blue-500 pl-4 py-1">
              <p className="text-sm font-medium mb-1">Current Batch</p>
              <p className="text-md font-semibold text-muted-foreground">
                {batchName}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Select Batch</Label>
            <Select
              onValueChange={(batchId) => setSelectedBatchId(batchId)}
              disabled={isPending}
            >
              <SelectTrigger className="w-full rounded-xs shadow-none dark:bg-background dark:hover:bg-background">
                <SelectValue placeholder="Select Batch" />
              </SelectTrigger>
              <SelectContent>
                {data?.map((batch) => (
                  <SelectItem value={batch.id} key={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <LoadingButton
            type="submit"
            onClick={handleTransfer}
            loadingText="Transfering..."
            successText="Transfered!"
            errorText={errorText || "Failed"}
            state={buttonState}
            onStateChange={setButtonState}
            className="w-full rounded-full"
            variant="default"
            icon={Send}
            disabled={!selectedBatchId}
          >
            Transfer
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};
