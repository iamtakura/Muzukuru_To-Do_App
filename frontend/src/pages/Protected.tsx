import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import Spinner from '../components/Spinner';
import type { Todo } from '../types';
import './Protected.css';

const Protected: React.FC = () => {
  const { user, token, logout, setUserInfo } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const navigate = useNavigate();

  const handleAuthFailure = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    // If no token is present in the context, reject immediately
    if (!token) {
      handleAuthFailure();
      return;
    }

    const initData = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Verify credentials and load user ID
        const protectedResponse = await client.get('/protected');
        const dbUser = protectedResponse.data.user;
        setUserInfo({ id: dbUser.id, username: dbUser.username });

        // 2. Fetch the existing todo list for this user
        const todosResponse = await client.get('/todos');
        setTodos(todosResponse.data);
      } catch (err: any) {
        if (err.response && err.response.status === 401) {
          handleAuthFailure();
        } else {
          setError('Failed to sync data with server. Check database connection.');
        }
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const titleVal = newTodoTitle.trim();
    if (!titleVal) return;

    setError('');
    setLoading(true);
    try {
      const response = await client.post('/todos', {
        title: titleVal,
        completed: false,
      });
      setTodos((prev) => [...prev, response.data]);
      setNewTodoTitle('');
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        handleAuthFailure();
      } else {
        setError('Failed to add task.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    setError('');
    setLoading(true);
    try {
      await client.delete(`/todos/${id}`);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        handleAuthFailure();
      } else {
        setError('Failed to remove task.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {loading && <Spinner />}
      <header className="dashboard-header">
        <div className="header-brand">
          <h1>Dashboard</h1>
          {user && (
            <span className="user-badge" id="user-display">
              Logged in as {user.username}
            </span>
          )}
        </div>
        <button onClick={handleAuthFailure} className="logout-btn" id="logout-button">
          Sign Out
        </button>
      </header>

      <main className="dashboard-content">
        {error && (
          <div className="dashboard-alert error" id="dashboard-error">
            {error}
          </div>
        )}

        <section className="todo-card">
          <h2>Create New Task</h2>
          <form onSubmit={handleAddTodo} className="todo-form" noValidate>
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
            />
            <button type="submit" className="add-todo-btn" id="add-todo-submit">
              Add Task
            </button>
          </form>
        </section>

        <section className="todos-list-card">
          <h2>Your Tasks</h2>
          {todos.length === 0 ? (
            <p className="no-todos" id="no-todos-msg">
              No tasks left! Rest or add some tasks above.
            </p>
          ) : (
            <ul className="todos-list" id="todos-list">
              {todos.map((todo) => (
                <li key={todo.id} className="todo-item">
                  <div className="todo-info">
                    <span className="todo-title">{todo.title}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="delete-todo-btn"
                    title="Delete task"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default Protected;
