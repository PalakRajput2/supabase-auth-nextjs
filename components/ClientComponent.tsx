"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";

export default function ClientComponent() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        console.log("User doesn't exist");
      } else {
        setUser(data?.user);
      }
    }
    getUser();
  }, []);

  return (
    <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 border border-gray-200">
      <div className=" flex text-xl font-semibold mb-4 text-gray-800 items-center gap-4">
        <FaUser />
        <h1 >
          User Profile
        </h1>
      </div>

      <div className="space-y-5 text-gray-700">
        <div>
          <span className="font-bold text-[20px]">Email:</span> {user?.email || "Not available"}
        </div>
        <div>
          <span className="font-bold text-[20px]">Name:</span>{" "}
          {user?.user_metadata?.username ||
            user?.user_metadata?.full_name ||
            "Anonymous"}
        </div>
      </div>
    </div>
  );
}
