"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// Define types
interface UserTodosResponse {
  error?: string;
  user?: { id: string };
  role?: string;
  todos?: { id: string; title: string; completed: boolean }[];
}

// Fetch user & todos securely
export async function getUserAndTodos(): Promise<UserTodosResponse> {
  const supabase = await createClient(); // FIX: Await the promise

  const { data: userSession, error: authError } = await supabase.auth.getUser();

  if (authError || !userSession?.user) {
    return { error: "Not authenticated" };
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", userSession.user.id)
    .single();

  if (userError || !user) {
    return { error: "User role not found" };
  }

  const { data: todos, error: todosError } = await supabase
    .from("todos")
    .select("id, title, completed")
    .order("created_at", { ascending: false });

  if (todosError) {
    return { error: "Error fetching todos", role: user.role };
  }

  return { user: userSession.user, role: user.role, todos: todos || [] };
}
