"use client";

import { Edit, FileCheck, HandHelping, Printer, Trash2 } from "lucide-react";
import { format } from "date-fns";

import { Document } from "@workspace/db";
import { ListActions } from "@workspace/ui/shared/list-actions";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";

import { ListActionButton } from "@/components/list-action-button";
import { ListActionLink } from "@/components/list-action-link";

import { Badge } from "@workspace/ui/components/badge";
import {
  useDeleteDocument,
  usePushToPrintTask,
  useToggleFinished,
  useToggleReceived,
} from "@/hooks/use-document";

interface DocumentWithRelation extends Document {
  className: {
    name: string;
  };
  subject: {
    name: string;
  };
  user: {
    name: string | null;
  };
}

interface HomeworkListProps {
  documents: DocumentWithRelation[];
}

export const DocumentList = ({ documents }: HomeworkListProps) => {
  const { onOpen } = useDeleteDocument();
  const { onOpen: onReceived } = useToggleReceived();
  const { onOpen: onFinished } = useToggleFinished();
  const { onOpen: onPrint } = usePushToPrintTask();

  return (
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
          <TableHead>Finished</TableHead>
          <TableHead>Printed</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((document) => (
          <TableRow key={document.id}>
            <TableCell>{document.type}</TableCell>
            <TableCell>{document.name}</TableCell>
            <TableCell>{document.subject.name}</TableCell>
            <TableCell>{document.className.name}</TableCell>
            <TableCell>
              {format(document.deliveryDate, "dd MMM yyyy hh:mm a")}
            </TableCell>
            <TableCell>{document.noOfCopy}</TableCell>
            <TableCell>
              <Badge variant={document.hasReceived ? "default" : "destructive"}>
                {document.hasReceived ? "Yes" : "No"}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={document.hasFinished ? "default" : "destructive"}>
                {document.hasFinished ? "Yes" : "No"}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={document.hasPrinted ? "default" : "destructive"}>
                {document.hasPrinted ? "Yes" : "No"}
              </Badge>
            </TableCell>
            <TableCell>{document.user?.name}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionLink
                  title="Edit"
                  href={`/exam/document/edit/${document.id}`}
                  icon={Edit}
                />
                <ListActionButton
                  title="Toggle Received"
                  icon={HandHelping}
                  onClick={() => onReceived(document.id, document.hasReceived)}
                />
                <ListActionButton
                  title="Toggle Finished"
                  icon={FileCheck}
                  onClick={() => onFinished(document.id, document.hasFinished)}
                />
                <ListActionButton
                  title="Push to Print"
                  icon={Printer}
                  onClick={() =>
                    onPrint(document.id, document.noOfCopy.toString())
                  }
                />
                <ListActionButton
                  isDanger
                  title="Delete"
                  icon={Trash2}
                  onClick={() => onOpen(document.id)}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
