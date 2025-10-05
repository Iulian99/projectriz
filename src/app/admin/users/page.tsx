"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useRole } from "@/app/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

type User = {
  id: number;
  name: string;
  email: string;
  identifier: string;
  role: string;
  department: string | null;
  position: string | null;
  status: string;
  managerId: number | null;
  manager: { id: number; name: string } | null;
  _count: { subordinates: number };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    identifier: "",
    password: "",
    role: "user",
    department: "",
    position: "",
    status: "active",
    managerId: null as number | null,
  });
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const { isAdmin } = useRole();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/dashboard");
      return;
    }

    fetchUsers();
  }, [authLoading, isAdmin, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);
        setManagers(
          data.users.filter(
            (user: User) => user.role === "manager" || user.role === "admin"
          )
        );
      } else {
        setError("Nu s-au putut încărca utilizatorii");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Nu s-au putut încărca utilizatorii");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const userData = editUser
        ? {
            ...editUser,
            department: editUser.department || "",
            position: editUser.position || "",
          }
        : newUser;

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (data.success) {
        await fetchUsers();
        setEditUser(null);
        setNewUser({
          name: "",
          email: "",
          identifier: "",
          password: "",
          role: "user",
          department: "",
          position: "",
          status: "active",
          managerId: null,
        });
        setShowNewUserForm(false);
      } else {
        setError(data.error || "Nu s-a putut salva utilizatorul");
      }
    } catch (err) {
      console.error("Error saving user:", err);
      setError("Nu s-a putut salva utilizatorul");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return null; // Router will redirect, but add this as a safeguard
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Administrare Utilizatori</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowNewUserForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Adaugă Utilizator Nou
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Nume</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Identificator</th>
                <th className="py-2 px-4 border-b">Rol</th>
                <th className="py-2 px-4 border-b">Departament</th>
                <th className="py-2 px-4 border-b">Poziție</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Manager</th>
                <th className="py-2 px-4 border-b">Subordonați</th>
                <th className="py-2 px-4 border-b">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{user.name}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b">{user.identifier}</td>
                  <td className="py-2 px-4 border-b">{user.role}</td>
                  <td className="py-2 px-4 border-b">
                    {user.department || "-"}
                  </td>
                  <td className="py-2 px-4 border-b">{user.position || "-"}</td>
                  <td className="py-2 px-4 border-b">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : user.status === "inactive"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">
                    {user.manager ? user.manager.name : "-"}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {user._count.subordinates}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => setEditUser(user)}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      Editează
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal pentru editare/adăugare utilizator */}
      {(editUser || showNewUserForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editUser ? "Editare Utilizator" : "Adăugare Utilizator Nou"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nume</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={editUser ? editUser.name : newUser.name}
                    onChange={(e) =>
                      editUser
                        ? setEditUser({ ...editUser, name: e.target.value })
                        : setNewUser({ ...newUser, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={editUser ? editUser.email : newUser.email}
                    onChange={(e) =>
                      editUser
                        ? setEditUser({ ...editUser, email: e.target.value })
                        : setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                  />
                </div>

                {!editUser && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Identificator
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={newUser.identifier}
                        onChange={(e) =>
                          setNewUser({ ...newUser, identifier: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Parolă
                      </label>
                      <input
                        type="password"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser({ ...newUser, password: e.target.value })
                        }
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Rol</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={editUser ? editUser.role : newUser.role}
                    onChange={(e) =>
                      editUser
                        ? setEditUser({ ...editUser, role: e.target.value })
                        : setNewUser({ ...newUser, role: e.target.value })
                    }
                  >
                    <option value="user">Utilizator</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={editUser ? editUser.status : newUser.status}
                    onChange={(e) =>
                      editUser
                        ? setEditUser({ ...editUser, status: e.target.value })
                        : setNewUser({ ...newUser, status: e.target.value })
                    }
                  >
                    <option value="active">Activ</option>
                    <option value="inactive">Inactiv</option>
                    <option value="suspended">Suspendat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Departament
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={
                      editUser ? editUser.department || "" : newUser.department
                    }
                    onChange={(e) =>
                      editUser
                        ? setEditUser({
                            ...editUser,
                            department: e.target.value,
                          })
                        : setNewUser({ ...newUser, department: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Poziție
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={
                      editUser ? editUser.position || "" : newUser.position
                    }
                    onChange={(e) =>
                      editUser
                        ? setEditUser({ ...editUser, position: e.target.value })
                        : setNewUser({ ...newUser, position: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Manager
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={
                      editUser
                        ? editUser.managerId || ""
                        : newUser.managerId || ""
                    }
                    onChange={(e) => {
                      const value = e.target.value
                        ? parseInt(e.target.value)
                        : null;
                      if (editUser) {
                        setEditUser({ ...editUser, managerId: value });
                      } else {
                        setNewUser({ ...newUser, managerId: value });
                      }
                    }}
                  >
                    <option value="">Fără manager</option>
                    {managers
                      .filter((m) => (editUser ? m.id !== editUser.id : true))
                      .map((manager) => (
                        <option key={manager.id} value={manager.id}>
                          {manager.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditUser(null);
                    setShowNewUserForm(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700"
                  disabled={isSubmitting}
                >
                  Anulează
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Se salvează..." : "Salvează"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
