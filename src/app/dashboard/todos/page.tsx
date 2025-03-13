"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Todos() {
  const supabase = createClient();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    async function fetchTodos() {
      const { data } = await supabase.from("todos").select("*").order("created_at", { ascending: false });
      setTodos(data || []);
    }

    fetchTodos();
  }, [supabase]);

  const addTodo = async () => {
    if (!newTodo) return;
    const { data, error } = await supabase.from("todos").insert([{ title: newTodo }]);
    if (!error) {
      setTodos([data[0], ...todos]);
      setNewTodo("");
    }
  };

  const toggleComplete = async (id, completed) => {
    await supabase.from("todos").update({ completed: !completed }).eq("id", id);
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !completed } : todo))
    );
  };

  return (
    <div>
      <h1>Manage Todos</h1>
      <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} />
      <button onClick={addTodo}>Add Todo</button>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.title} - {todo.completed ? "✅" : "❌"}
            <button onClick={() => toggleComplete(todo.id, todo.completed)}>
              Toggle
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
