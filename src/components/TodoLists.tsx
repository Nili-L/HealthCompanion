import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckSquare, Plus, Trash2 } from "lucide-react";

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  source: "manual" | "ocr" | "generated";
  createdAt: string;
}

export function TodoLists({ accessToken }: { accessToken: string }) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState("");

  const projectId = "cvsxfzllhhhpdyckdmqg";

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/todos`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTodos(data.todos || []);
      }
    } catch (error) {
      toast.error("Failed to load todos");
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/todos`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: newTodo, priority: "medium", source: "manual" }),
        }
      );

      if (response.ok) {
        setNewTodo("");
        fetchTodos();
      }
    } catch (error) {
      toast.error("Failed to add todo");
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/todos/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ completed: !completed }),
        }
      );
      fetchTodos();
    } catch (error) {
      toast.error("Failed to update todo");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">To-Do Lists</h2>
        <p className="text-muted-foreground">
          Manage tasks from documents, appointments, and manual entries
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter a new task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddTodo()}
            />
            <Button onClick={handleAddTodo}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todos.filter((t) => !t.completed).length > 0 ? (
              todos
                .filter((t) => !t.completed)
                .map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => handleToggle(todo.id, todo.completed)}
                    />
                    <span className="flex-1">{todo.title}</span>
                    <Badge variant="outline">{todo.source}</Badge>
                  </div>
                ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active tasks
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todos.filter((t) => t.completed).length > 0 ? (
              todos
                .filter((t) => t.completed)
                .map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-3 border rounded-lg opacity-60"
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => handleToggle(todo.id, todo.completed)}
                    />
                    <span className="flex-1 line-through">{todo.title}</span>
                  </div>
                ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No completed tasks
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
