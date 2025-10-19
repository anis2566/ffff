import { Separator } from "@workspace/ui/components/separator";
import { TodoForm } from "./todo-form";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";
import { TodoList } from "./todo-list";

export const TodoContainer = () => {
  return (
    <CardWrapper title="Todos">
      <TodoForm />
      <Separator className="my-2" />
      <TodoList />
    </CardWrapper>
  );
};
