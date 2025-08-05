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

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const scrollContainerRef = useRef(null);
  const lastTodoRef = useRef(null);

  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const tokenFromURL = params.get("token");

  if (tokenFromURL) {
    localStorage.setItem("token", tokenFromURL);
    navigate("/todos", { replace: true });
    setTimeout(() => {
      resetAndLoadTodos();
    }, 0);
    return; 
  }

  const storedToken = localStorage.getItem("token");
  if (!storedToken) {
    navigate("/login");
  } else {
    resetAndLoadTodos();
  }
}, [location.search, navigate]);

  const resetAndLoadTodos = () => {
    setTodos([]);
    setPage(1);
    setHasMore(true);
    loadTodos(1, true);
  };

  const loadTodos = async (pageToLoad = page, isFirstLoad = false) => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const data = await fetchTodosAPI(token, pageToLoad);

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
      { root: scrollContainerRef.current, threshold: 1 }
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
          ...prev
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
    <div className="min-h-screen bg-gray-100 p-8">
      {loading && <Loader />}

      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Your Todos</h1>

        <form onSubmit={handleSubmit} className="mb-6 space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
          <button
            type="submit"
            className={`w-full ${
              editId ? "bg-green-600" : "bg-blue-600"
            } text-white py-2 px-4 rounded-lg hover:opacity-90 transition`}
          >
            {editId ? "Update Todo" : "Add Todo"}
          </button>
        </form>

          <div
          className="space-y-3 max-h-[400px] overflow-y-auto pr-2"
          ref={scrollContainerRef}
        >
          {todos.length === 0 ? (
            <p className="text-gray-500">No todos found</p>
          ) : (
            todos.map((todo, index) => (
              <li
                key={todo.id}
                ref={index === todos.length - 1 ? lastTodoRef : null}
                className="p-4 bg-gray-50 border rounded-lg flex justify-between items-center"
              >
                <div>
                  <h2 className="font-semibold">{todo.title}</h2>
                  <p className="text-gray-600">{todo.description}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditId(todo.id);
                      setTitle(todo.title);
                      setDescription(todo.description);
                    }}
                    className="flex items-center gap-1 bg-yellow-400 text-white px-3 py-1 rounded-lg hover:bg-yellow-500 transition"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                  >
                    <FaTrashAlt /> Delete
                  </button>
                </div>
              </li>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
