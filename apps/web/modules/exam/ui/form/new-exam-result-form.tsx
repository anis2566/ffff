"use client";

import { useTRPC } from "@/trpc/react";
import { useMutation, useQueries } from "@tanstack/react-query";
import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";
import {
  Collapsible,
  CollapsibleContent,
} from "@workspace/ui/components/collapsible";
import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";

type Student = {
  id: string;
  name: string;
  imageUrl: string | null;
  studentId: number;
  mPhone: string;
};

export const NewExamResultForm = () => {
  const [classNameId, setClassNameId] = useState<string>("");
  const [batchId, setBatchId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [examId, setExamId] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const trpc = useTRPC();
  const router = useRouter();

  const { mutate: createResult, isPending } = useMutation(
    trpc.examResult.createMany.mutationOptions({
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
        // queryClient.invalidateQueries(
        //   trpc.exam.getMany.queryOptions({ ...filters })
        // );
        router.push("/exam/result");
      },
    })
  );

  const [
    { data: classes },
    { data: batches },
    { data: categories },
    { data: exams },
  ] = useQueries({
    queries: [
      trpc.class.forSelect.queryOptions({ search: "" }),
      trpc.batch.getByClass.queryOptions(classNameId, {
        enabled: !!classNameId,
      }),
      trpc.examCategory.forSelect.queryOptions({ search: "" }),
      trpc.exam.getByBathchCategory.queryOptions(
        { batchId, categoryId },
        {
          enabled: !!batchId && !!categoryId,
        }
      ),
    ],
  });

  const allSelect =
    students &&
    students.length > 0 &&
    selectedStudents.length === students.length;

  const someSelect =
    students &&
    students.length > 0 &&
    selectedStudents.length > 0 &&
    !allSelect;

  const markAllSelect = () => {
    setSelectedStudents(students.map((s) => s.id));
  };

  const markAllUnselect = () => {
    setSelectedStudents([]);
  };

  const toggleAll = () => {
    if (allSelect) {
      markAllUnselect();
    } else {
      markAllSelect();
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter((s) => s !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const handleSubmit = async () => {
    setButtonState("loading");
    createResult({
      examId,
      studentIds: selectedStudents,
    });
  };

  return (
    <div className="space-y-6">
      <CardWrapper
        title="Find Exam"
        description="Assign exam result to the system"
      >
        <div className="space-y-4">
          <Select
            value={classNameId}
            onValueChange={(value) => {
              setClassNameId(value);
              setBatchId("");
              setStudents([]);
              setSelectedStudents([]);
            }}
          >
            <SelectTrigger className="w-full rounded-xs shadow-none dark:bg-background dark:hover:bg-background">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              {classes?.map((classItem) => (
                <SelectItem key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={batchId}
            onValueChange={(value) => {
              setBatchId(value);
              setStudents(batches?.find((b) => b.id === value)?.students || []);
              setSelectedStudents([]);
            }}
            disabled={!classNameId}
          >
            <SelectTrigger className="w-full rounded-xs shadow-none dark:bg-background dark:hover:bg-background">
              <SelectValue placeholder="Batch" />
            </SelectTrigger>
            <SelectContent>
              {batches?.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={categoryId}
            onValueChange={(value) => {
              setCategoryId(value);
              setExamId("");
            }}
          >
            <SelectTrigger className="w-full rounded-xs shadow-none dark:bg-background dark:hover:bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={examId}
            onValueChange={(value) => {
              setExamId(value);
            }}
            disabled={!batchId || !categoryId}
          >
            <SelectTrigger className="w-full rounded-xs shadow-none dark:bg-background dark:hover:bg-background">
              <SelectValue placeholder="Exam" />
            </SelectTrigger>
            <SelectContent>
              {exams?.map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardWrapper>

      <Collapsible open={students?.length > 0 && examId !== ""}>
        <CollapsibleContent>
          <CardWrapper
            title="Examinees"
            description={`${selectedStudents.length} of ${students?.length} selected`}
            contentClassName="space-y-4"
          >
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant={allSelect ? "secondary" : "ghost"}
                onClick={markAllSelect}
                disabled={isPending}
              >
                Select All
              </Button>
              <Button
                size="sm"
                variant={!allSelect ? "secondary" : "ghost"}
                onClick={markAllUnselect}
                disabled={isPending}
              >
                Unselect All
              </Button>
              {selectedStudents.length > 0 && (
                <Button
                  size="sm"
                  className="rounded-full"
                  variant="destructive"
                  onClick={() => setSelectedStudents([])}
                  disabled={isPending}
                >
                  Clear
                </Button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-background/60">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelect}
                      onCheckedChange={toggleAll}
                      aria-label="Select all students"
                      className={someSelect ? "opacity-50" : ""}
                      disabled={isPending}
                    />
                  </TableHead>
                  <TableHead>#ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students && students.length > 0 ? (
                  students.map((student, index) => {
                    const isSelected = selectedStudents.includes(student.id);
                    return (
                      <TableRow
                        key={index}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          console.log(student);
                          toggleSelect(student.id);
                        }}
                      >
                        <TableCell
                          className="w-12"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(student.id)}
                            aria-label={`Mark ${student.name} as selected`}
                            disabled={isPending}
                          />
                        </TableCell>
                        <TableCell>{student.studentId}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.mPhone}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No students found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <LoadingButton
              type="button"
              onClick={handleSubmit}
              loadingText="Submitting..."
              successText="Submitted!"
              errorText={errorText || "Failed"}
              state={buttonState}
              onStateChange={setButtonState}
              className="w-full rounded-full"
              icon={Send}
              disabled={selectedStudents.length === 0}
            >
              Submit
            </LoadingButton>
          </CardWrapper>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
