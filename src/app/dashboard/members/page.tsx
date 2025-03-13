"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Members() {
  const supabase = createClient();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    async function fetchMembers() {
      const { data } = await supabase
        .from("users")
        .select("id, role, tenant_id");

      setMembers(data || []);
    }

    fetchMembers();
  }, [supabase]);

  const changeRole = async (userId: string, newRole: "admin" | "member") => {
    await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", userId);
    
    setMembers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
    );
  };

  return (
    <div>
      <h1>Manage Members</h1>
      <ul>
        {members.map((user) => (
          <li key={user.id}>
            {user.id} - {user.role}
            {user.role !== "admin" && (
              <button onClick={() => changeRole(user.id, "admin")}>Make Admin</button>
            )}
            {user.role !== "member" && (
              <button onClick={() => changeRole(user.id, "member")}>Make Member</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
