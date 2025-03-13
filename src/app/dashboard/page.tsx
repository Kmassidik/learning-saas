"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserAndTodos } from "./actions";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export default function Dashboard() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const response = await getUserAndTodos();

      if (response.error) {
        console.log(response);
        
        setError(response.error);
        router.push("/login");
        return;
      }

      setUserRole(response.role || "member");
      setTodos(response.todos || []);
      setLoading(false);
    }

    fetchData();
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen dark:text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

        {error && <p className="text-red-500">{error}</p>}

        <div className="flex space-x-4 mb-6">
          <a href="/dashboard/todos" className="text-blue-600 hover:underline">
            Manage Todos
          </a>
          <a href="/dashboard/members" className="text-blue-600 hover:underline">
            Manage Members
          </a>
        </div>

        <h2 className="text-xl font-semibold mb-3">Your Todos</h2>
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow"
            >
              <span>{todo.title}</span>
              <span>{todo.completed ? "✅" : "❌"}</span>
            </li>
          ))}
        </ul>

        {userRole === "admin" && <p className="mt-4 text-green-600">You have admin access.</p>}
      </div>
    </div>
  );
}
