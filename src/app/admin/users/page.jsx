"use client";

import { useEffect, useState, useMemo } from "react";
import { debounce } from "@/utils/debounce";
import { authApi } from "@/mocks/auth";
import AdminGuard from "../AdminGuard";
import { FiUser, FiTrash2, FiUserCheck, FiShield, FiAlertOctagon, FiUserX, FiX } from "react-icons/fi";
import { useToast } from "@/context/toaster";
import { useAdminTheme } from "../layout";

export default function AdminUsersPage() {
  const { theme } = useAdminTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearchDebounced = useMemo(
    () => debounce((value) => setDebouncedSearch(value), 300),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    handleSearchDebounced(value);
  };
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionInProgress, setActionInProgress] = useState(null);

  const toastContext = useToast();
  const setAlert = toastContext?.setAlert;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authApi.getAllUsers({ q: debouncedSearch });
      if (res.data?.status === "SUCCESS") {
        setUsers(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
      setAlert?.({
        open: true,
        message: "Failed to fetch user list from server",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch]);

  const handleStatusChange = async (userId, newStatus) => {
    setActionInProgress(userId);
    try {
      const res = await authApi.updateUserStatus(userId, newStatus);
      if (res.data?.status === "SUCCESS") {
        setAlert?.({
          open: true,
          message: `User status changed to ${newStatus} successfully!`,
          severity: "success",
        });
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
        );
      } else {
        setAlert?.({
          open: true,
          message: res.data?.message || "Failed to update user status",
          severity: "error",
        });
      }
    } catch (error) {
      console.error(error);
      setAlert?.({
        open: true,
        message: "Network error updating user status",
        severity: "error",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    setActionInProgress(userId);
    try {
      const res = await authApi.updateUserRole(userId, newRole);
      if (res.data?.status === "SUCCESS") {
        setAlert?.({
          open: true,
          message: `User role successfully updated to ${newRole}!`,
          severity: "success",
        });
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        setAlert?.({
          open: true,
          message: res.data?.message || "Failed to toggle role",
          severity: "error",
        });
      }
    } catch (error) {
      console.error(error);
      setAlert?.({
        open: true,
        message: "Network error updating role",
        severity: "error",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("ARE YOU ABSOLUTELY SURE? This will permanently terminate this user account!")) {
      return;
    }
    setActionInProgress(userId);
    try {
      const res = await authApi.deleteUser(userId);
      if (res.data?.status === "SUCCESS") {
        setAlert?.({
          open: true,
          message: "User account has been permanently terminated!",
          severity: "success",
        });
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      } else {
        setAlert?.({
          open: true,
          message: res.data?.message || "Failed to terminate user account",
          severity: "error",
        });
      }
    } catch (error) {
      console.error(error);
      setAlert?.({
        open: true,
        message: "Network error terminating user account",
        severity: "error",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u._id?.toLowerCase().includes(debouncedSearch.toLowerCase());
    
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* Statistics Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Accounts",
              val: users.length,
              border: "border-gray-500",
              color: "text-blue-500",
            },
            {
              label: "Admin Accounts",
              val: users.filter((u) => u.role === "admin").length,
              border: "border-red-500",
              color: "text-red-500",
            },
            {
              label: "On Hold",
              val: users.filter((u) => u.status === "on-hold").length,
              border: "border-yellow-500",
              color: "text-yellow-500",
            },
            {
              label: "Blocked Accounts",
              val: users.filter((u) => u.status === "blocked").length,
              border: "border-purple-500",
              color: "text-purple-500",
            },
          ].map((item, index) => (
            <div
              key={index}
              className={`p-5 rounded-xl border transition-all duration-200 ${
                theme === "dark"
                  ? "bg-[#0c0c0e] border-[#1a1a1f] hover:border-gray-800"
                  : "bg-white border-gray-200 shadow-sm hover:shadow"
              }`}
            >
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                {item.label}
              </p>
              <p className={`text-3xl font-extrabold font-sans mt-2 ${item.color}`}>
                {loading ? "..." : item.val}
              </p>
            </div>
          ))}
        </div>

        {/* Filter Bar and Search Input */}
        <div
          className={`flex flex-col lg:flex-row gap-4 justify-between items-center p-4 border rounded-xl transition-all duration-200 ${
            theme === "dark" ? "bg-[#0c0c0e] border-[#1a1a1f]" : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          {/* Search Field */}
          <div className="w-full lg:max-w-sm relative">
            <input
              type="text"
              placeholder="Search by name, email or ID..."
              value={search}
              onChange={handleSearchChange}
              className={`w-full px-4 pr-10 py-2.5 text-xs font-semibold rounded-lg border focus:outline-none focus:border-red-500 transition-colors ${
                theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-gray-50 border-gray-200 text-gray-800"
              }`}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setDebouncedSearch("");
                }}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
                  theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          {/* Action Filters */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-end">
            {/* Role Filter */}
            <div className="flex gap-1 bg-black/10 dark:bg-white/5 p-1 rounded-lg">
              {["ALL", "USER", "ADMIN"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded transition-all cursor-pointer ${
                    roleFilter === r
                      ? "bg-red-600 text-white shadow"
                      : theme === "dark"
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex gap-1 bg-black/10 dark:bg-white/5 p-1 rounded-lg">
              {["ALL", "ACTIVE", "ON-HOLD", "BLOCKED"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded transition-all cursor-pointer ${
                    statusFilter === s
                      ? "bg-red-600 text-white shadow"
                      : theme === "dark"
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Accounts Table */}
        <div
          className={`border rounded-xl overflow-hidden transition-all duration-200 ${
            theme === "dark" ? "bg-[#0c0c0e] border-[#1a1a1f]" : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className={`border-b transition-colors duration-200 ${
                    theme === "dark" ? "border-[#1a1a1f] text-gray-500" : "border-gray-200 text-gray-400"
                  } text-[10px] uppercase tracking-widest font-bold`}
                >
                  <th className="p-4 pl-6">User ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 pr-6 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y transition-colors duration-200 ${
                  theme === "dark" ? "divide-[#1a1a1f] text-gray-300" : "divide-gray-200 text-gray-600"
                } text-xs font-semibold`}
              >
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-20 text-center">
                      <div
                        className={`w-8 h-8 border-4 border-t-red-600 rounded-full animate-spin inline-block ${
                          theme === "dark" ? "border-[#333]" : "border-gray-200"
                        }`}
                      ></div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-500 uppercase tracking-widest text-[10px]">
                      No accounts matched the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className={`transition-all group ${
                        theme === "dark" ? "hover:bg-[#121215]/40" : "hover:bg-gray-50/50"
                      }`}
                    >
                      {/* ID */}
                      <td className="p-4 pl-6 font-mono text-[10px] text-gray-500">
                        #{user._id.slice(-8).toUpperCase()}
                      </td>

                      {/* Name */}
                      <td className={`p-4 font-bold transition-colors ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${user.role === "admin" ? "bg-red-500 animate-pulse" : "bg-gray-400"}`}></span>
                          {user.name}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="p-4 text-gray-450">{user.email}</td>

                      {/* Role Badge */}
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border tracking-wider ${
                            user.role === "admin"
                              ? theme === "dark"
                                ? "bg-red-950/20 border-red-900/30 text-red-400"
                                : "bg-red-50 border-red-200 text-red-600"
                              : theme === "dark"
                              ? "bg-gray-800/40 border-gray-700/30 text-gray-400"
                              : "bg-gray-100 border-gray-300 text-gray-600"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border ${
                            user.status === "active"
                              ? theme === "dark"
                                ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-400"
                                : "bg-emerald-50 border-emerald-200 text-emerald-600"
                              : user.status === "on-hold"
                              ? theme === "dark"
                                ? "bg-amber-950/20 border-amber-900/30 text-amber-400"
                                : "bg-amber-50 border-amber-200 text-amber-600"
                              : theme === "dark"
                              ? "bg-purple-950/20 border-purple-900/30 text-purple-400"
                              : "bg-purple-50 border-purple-200 text-purple-600"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="p-4 text-gray-400">
                        {new Date(user.createdAt || Date.now()).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          {/* Block/Unblock toggle */}
                          {user.status === "blocked" ? (
                            <button
                              disabled={actionInProgress === user._id}
                              onClick={() => handleStatusChange(user._id, "active")}
                              className={`p-2 border rounded-lg transition-colors cursor-pointer text-emerald-500 hover:bg-emerald-500/10 ${
                                theme === "dark" ? "bg-[#131317] border-emerald-900/30" : "bg-white border-emerald-200"
                              }`}
                              title="Unblock User"
                            >
                              <FiUserCheck size={14} />
                            </button>
                          ) : (
                            <button
                              disabled={actionInProgress === user._id || user.role === "admin"}
                              onClick={() => handleStatusChange(user._id, "blocked")}
                              className={`p-2 border rounded-lg transition-colors cursor-pointer text-purple-500 hover:bg-purple-500/10 ${
                                theme === "dark" ? "bg-[#131317] border-purple-900/30" : "bg-white border-purple-200"
                              } disabled:opacity-40 disabled:cursor-not-allowed`}
                              title="Block User"
                            >
                              <FiUserX size={14} />
                            </button>
                          )}

                          {/* Hold/Unhold toggle */}
                          {user.status === "on-hold" ? (
                            <button
                              disabled={actionInProgress === user._id}
                              onClick={() => handleStatusChange(user._id, "active")}
                              className={`p-2 border rounded-lg transition-colors cursor-pointer text-emerald-500 hover:bg-emerald-500/10 ${
                                theme === "dark" ? "bg-[#131317] border-emerald-900/30" : "bg-white border-emerald-200"
                              }`}
                              title="Unhold Account"
                            >
                              <FiUserCheck size={14} />
                            </button>
                          ) : (
                            <button
                              disabled={actionInProgress === user._id || user.role === "admin" || user.status === "blocked"}
                              onClick={() => handleStatusChange(user._id, "on-hold")}
                              className={`p-2 border rounded-lg transition-colors cursor-pointer text-amber-500 hover:bg-amber-500/10 ${
                                theme === "dark" ? "bg-[#131317] border-amber-900/30" : "bg-white border-amber-200"
                              } disabled:opacity-40 disabled:cursor-not-allowed`}
                              title="Hold Account"
                            >
                              <FiAlertOctagon size={14} />
                            </button>
                          )}

                          {/* Toggle Admin/User Role */}
                          <button
                            disabled={actionInProgress === user._id}
                            onClick={() => handleRoleToggle(user._id, user.role)}
                            className={`p-2 border rounded-lg transition-colors cursor-pointer text-blue-500 hover:bg-blue-500/10 ${
                              theme === "dark" ? "bg-[#131317] border-blue-900/30" : "bg-white border-blue-200"
                            }`}
                            title={user.role === "admin" ? "Demote to User" : "Promote to Admin"}
                          >
                            <FiShield size={14} />
                          </button>

                          {/* Permanently delete/terminate user */}
                          <button
                            disabled={actionInProgress === user._id}
                            onClick={() => handleDeleteUser(user._id)}
                            className={`p-2 border rounded-lg transition-colors cursor-pointer text-red-500 hover:bg-red-500/10 ${
                              theme === "dark" ? "bg-[#131317] border-red-900/30" : "bg-white border-red-200"
                            }`}
                            title="Terminate Account"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
