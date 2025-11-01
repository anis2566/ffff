"use client";

import { useRouter } from "next/navigation";

import { Badge } from "@workspace/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";

import { useShowTransaction } from "@/hooks/use-salary-payment";

export const TransactionModal = () => {
  const { isOpen, onClose, transactionId, amount, status } =
    useShowTransaction();
  const router = useRouter();

  const handleClose = () => {
    onClose();
    router.push("/fee/salary");
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>This is a transaction details.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 py-4">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Transaction ID
            </span>
            <span className="font-mono text-xl font-bold tracking-wider">
              {transactionId}
            </span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Amount
            </span>
            <span className="font-medium">{amount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Status
            </span>
            <Badge className="rounded-full">{status}</Badge>
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
