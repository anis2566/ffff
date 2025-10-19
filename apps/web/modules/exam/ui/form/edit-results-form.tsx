"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Edit, Send } from "lucide-react";

import { ExamResult } from "@workspace/db";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";
import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";

type Result = {
  id: string;
  cqMarks: number;
  mcqMarks: number;
  writtenMarks: number;
};

interface ExamResultWithRealId extends ExamResult {
  student: {
    id: string;
    name: string;
    studentId: number;
  };
}

interface EditResultsFormProps {
  resultId: string;
  results: ExamResultWithRealId[];
  hasCq: boolean;
  hasMcq: boolean;
  hasWritten: boolean;
  maxCqValue: number;
  maxMcqValue: number;
  maxWrittenValue: number;
}

export const EditResultsForm = ({
  resultId,
  results,
  hasCq,
  hasMcq,
  hasWritten,
  maxCqValue,
  maxMcqValue,
  maxWrittenValue,
}: EditResultsFormProps) => {
  const [values, setValues] = useState<Result[]>(
    results.map((result) => ({
      id: result.id,
      cqMarks: result.cqMarks ?? 0,
      mcqMarks: result.mcqMarks ?? 0,
      writtenMarks: result.writtenMarks ?? 0,
    }))
  );
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");
  const [enableEdit, setEnableEdit] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: updateResults, isPending } = useMutation(
    trpc.examResult.updateResults.mutationOptions({
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
        setEnableEdit(false);
        queryClient.invalidateQueries(
          trpc.examResult.getOne.queryOptions(resultId)
        );
        router.push(`/exam/result/${resultId}`);
      },
    })
  );

  const handleInputChange = (
    resultId: string,
    field: "cqMarks" | "mcqMarks" | "writtenMarks",
    value: string,
    maxValue: number
  ) => {
    const numValue = value === "" ? 0 : Number(value);

    if (numValue > maxValue) {
      return;
    }

    setValues((prev) =>
      prev.map((result) =>
        result.id === resultId ? { ...result, [field]: numValue } : result
      )
    );
  };

  const getResultValue = (resultId: string) => {
    return values.find((v) => v.id === resultId);
  };

  const calculateTotal = (resultId: string, attended: boolean) => {
    if (!attended) return 0;
    const resultValue = getResultValue(resultId);
    if (!resultValue) return 0;
    return (
      resultValue.cqMarks + resultValue.mcqMarks + resultValue.writtenMarks
    );
  };

  const handleSubmit = () => {
    setButtonState("loading");
    updateResults({
      resultId,
      results: values,
    });
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <ListCardWrapper
        title="Results"
        value={results.length}
        actionButtons
        actionButtonIcon={Edit}
        actionButtonText={enableEdit ? "Cancel" : "Edit"}
        onClickAction={() => setEnableEdit(!enableEdit)}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-background/60">
              <TableHead>#ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>CQ Marks ({maxCqValue})</TableHead>
              <TableHead>MCQ Marks ({maxMcqValue})</TableHead>
              <TableHead>Written Marks ({maxWrittenValue})</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => {
              const resultValue = getResultValue(result.id);
              return (
                <TableRow
                  key={result.id}
                  className={cn(
                    "",
                    !result.attended && "opacity-50 bg-muted/30"
                  )}
                >
                  <TableCell>{result.student.studentId}</TableCell>
                  <TableCell>{result.student.name}</TableCell>
                  <TableCell>
                    {enableEdit ? (
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        max={maxCqValue}
                        value={resultValue?.cqMarks ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            result.id,
                            "cqMarks",
                            e.target.value,
                            maxCqValue
                          )
                        }
                        className="w-24 bg-background dark:bg-background rounded-xs shadow-none"
                        placeholder="0"
                        disabled={!hasCq || !result.attended || isPending}
                      />
                    ) : (
                      <span className="text-sm">
                        {resultValue?.cqMarks ?? 0}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {enableEdit ? (
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        max={maxMcqValue}
                        value={resultValue?.mcqMarks ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            result.id,
                            "mcqMarks",
                            e.target.value,
                            maxMcqValue
                          )
                        }
                        className="w-24 bg-background dark:bg-background rounded-xs shadow-none"
                        placeholder="0"
                        disabled={!hasMcq || !result.attended || isPending}
                      />
                    ) : (
                      <span className="text-sm">
                        {resultValue?.mcqMarks ?? 0}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {enableEdit ? (
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        max={maxWrittenValue}
                        value={resultValue?.writtenMarks ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            result.id,
                            "writtenMarks",
                            e.target.value,
                            maxWrittenValue
                          )
                        }
                        className="w-24 bg-background dark:bg-background rounded-xs shadow-none"
                        placeholder="0"
                        disabled={!hasWritten || !result.attended || isPending}
                      />
                    ) : (
                      <span className="text-sm">
                        {resultValue?.writtenMarks ?? 0}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="w-24 px-3 py-2 bg-muted/50 rounded-xs text-center font-semibold">
                      {calculateTotal(result.id, result.attended)}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {enableEdit && (
          <LoadingButton
            type="button"
            onClick={handleSubmit}
            loadingText="Updating..."
            successText="Updated!"
            errorText={errorText || "Failed"}
            state={buttonState}
            onStateChange={setButtonState}
            className="w-full rounded-full"
            icon={Send}
          >
            Update
          </LoadingButton>
        )}
      </ListCardWrapper>
    </form>
  );
};
