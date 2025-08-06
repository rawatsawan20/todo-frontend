import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Loader from "../components/Loader";
import { FaEdit, FaTrashAlt, FaSignOutAlt } from "react-icons/fa";
import {
  fetchTodosAPI,
  addTodoAPI,
  updateTodoAPI,
  deleteTodoAPI,
} from "../utils/api";
import "react-toastify/dist/ReactToastify.css";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [authToken, setAuthToken] = useState(localStorage.getItem("token") || "");
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const lastTodoRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromURL = params.get("token");

    if (tokenFromURL) {
      localStorage.setItem("token", tokenFromURL);
      setAuthToken(tokenFromURL);
      window.history.replaceState({}, document.title, "/todos");
      resetAndLoadTodos(tokenFromURL);
      return;
    }

    if (!authToken) {
      navigate("/todos");
    } else {
      resetAndLoadTodos(authToken);
    }
  }, [location.search, navigate]);

  const resetAndLoadTodos = (tokenValue) => {
    setTodos([]);
    setPage(1);
    setHasMore(true);
    loadTodos(1, true, tokenValue);
  };

  const loadTodos = async (pageToLoad = page, isFirstLoad = false, tokenToUse = authToken) => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const data = await fetchTodosAPI(tokenToUse, pageToLoad);

      setTodos((prev) => {
        if (isFirstLoad) return data.todos;
        const existingIds = new Set(prev.map((t) => t.id));
        const newTodos = data.todos.filter((t) => !existingIds.has(t.id));
        return [...prev, ...newTodos];
      });

      setHasMore(data.hasMore);
      setPage((prev) => prev + 1);
    } catch {
      toast.error("Failed to fetch todos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!lastTodoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadTodos();
        }
      },
      { root: null, threshold: 1 }
    );

    observer.observe(lastTodoRef.current);

    return () => {
      if (lastTodoRef.current) observer.unobserve(lastTodoRef.current);
    };
  }, [todos, hasMore, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editId) {
        await updateTodoAPI(token, editId, title, description);
        toast.success("✅ Todo updated!");
        setTodos((prev) =>
          prev.map((todo) =>
            todo.id === editId ? { ...todo, title, description } : todo
          )
        );
      } else {
        const newTodo = await addTodoAPI(token, title, description);
        toast.success("✅ Todo added!");
        setTodos((prev) => [
          { id: newTodo.id, title: newTodo.title, description: newTodo.description },
          ...prev,
        ]);
      }
      setTitle("");
      setDescription("");
      setEditId(null);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the todo!",
      icon: "warning",
      showCancelButton: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: "swal2-confirm",
        cancelButton: "swal2-cancel",
      },
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          await deleteTodoAPI(token, id);
          toast.success("🗑️ Todo deleted");
          setTodos((prev) => prev.filter((todo) => todo.id !== id));
        } catch {
          toast.error("Failed to delete todo");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout Confirmation",
      text: "Are you sure you want to log out?",
      icon: "question",
      showCancelButton: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: "swal2-confirm",
        cancelButton: "swal2-cancel",
      },
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        toast.info("🚪 Logged out successfully");
        navigate("/");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6EE7B7] via-[#3B82F6] to-[#9333EA] flex items-center justify-center p-6">
      {loading && <Loader />}
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">✨ My Todos</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            {editId ? "Update" : "Add"}
          </button>
        </form>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {todos.map((todo, index) => (
            <div
              key={todo.id}
              ref={index === todos.length - 1 ? lastTodoRef : null}
              className="bg-gradient-to-r from-[#dfe9f3] via-[#ffffff] to-[#dfe9f3] rounded-lg p-4 shadow hover:shadow-lg hover:scale-[1.02] transition-all flex justify-between items-center"
            >
              <div>
                <h2 className="font-bold text-lg text-gray-800">{todo.title}</h2>
                <p className="text-gray-600">{todo.description}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditId(todo.id);
                    setTitle(todo.title);
                    setDescription(todo.description);
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
