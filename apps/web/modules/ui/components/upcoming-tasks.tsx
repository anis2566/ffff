import { Document } from "@workspace/db";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { format } from "date-fns";
import { Badge } from "@workspace/ui/components/badge";
import { ListActions } from "@workspace/ui/shared/list-actions";
import { ListActionButton } from "@/components/list-action-button";
import { FileCheck, HandHelping } from "lucide-react";
import { useToggleFinished, useToggleReceived } from "@/hooks/use-document";

interface DocumentWithRelation extends Document {
  className: {
    name: string;
  };
  subject: {
    name: string;
  };
}

interface UpcomingTasksProps {
  tasks: DocumentWithRelation[];
}

export const UpcomingTasks = ({ tasks }: UpcomingTasksProps) => {
  const { onOpen: onReceived } = useToggleReceived();
  const { onOpen: onFinished } = useToggleFinished();

  return (
    <CardWrapper title="Upcoming tasks">
      <Table>
        <TableHeader>
          <TableRow className="bg-background/60">
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>D. Date</TableHead>
            <TableHead>Copies</TableHead>
            <TableHead>Received</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>{task.type}</TableCell>
              <TableCell>{task.name}</TableCell>
              <TableCell>{task.subject.name}</TableCell>
              <TableCell>{task.className.name}</TableCell>
              <TableCell>
                {format(task.deliveryDate, "dd MMM yyyy hh:mm a")}
              </TableCell>
              <TableCell>{task.noOfCopy}</TableCell>
              <TableCell>
                <Badge variant={task.hasReceived ? "default" : "destructive"}>
                  {task.hasReceived ? "Yes" : "No"}
                </Badge>
              </TableCell>
              <TableCell>
                <ListActions>
                  <ListActionButton
                    title="Toggle Received"
                    icon={HandHelping}
                    onClick={() => onReceived(task.id, task.hasReceived)}
                  />
                  <ListActionButton
                    title="Toggle Finished"
                    icon={FileCheck}
                    onClick={() => onFinished(task.id, task.hasFinished)}
                  />
                </ListActions>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardWrapper>
  );
};
