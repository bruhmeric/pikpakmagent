import React, { useState, useCallback, useEffect } from 'react';
import { Task, PikPakTask } from './types';
import * as pikpakService from './services/pikpakService';
import MagnetForm from './components/MagnetForm';
import TaskList from './components/TaskList';
import Login from './components/Login';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('pikpak_token'));

  const isAuthenticated = !!token;

  const handleLogin = async (credentials: { username: string; password: string }) => {
    const { token } = await pikpakService.login(credentials);
    localStorage.setItem('pikpak_token', token);
    setToken(token);
    setTasks([]); // Reset tasks on new login
  };

  const handleLogout = () => {
    localStorage.removeItem('pikpak_token');
    setToken(null);
    setTasks([]);
  };

  const handleAddTask = useCallback(async (magnetLink: string) => {
    if (!token) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const submittedTask = await pikpakService.submitMagnetLink(magnetLink, token);
      // Add to list immediately for better UX
      setTasks(prevTasks => [
        { ...submittedTask, phase: 'PHASE_TYPE_PENDING' },
        ...prevTasks
      ]);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [token]);

  const handleGetDownloadLink = useCallback(async (task: Task) => {
     if (!token || !task.file_id) return;

     setTasks(prevTasks => prevTasks.map(t =>
        t.id === task.id ? { ...t, isFetchingLink: true } : t
     ));

     try {
        const { downloadUrl } = await pikpakService.getDownloadLink(task.file_id, token);
        setTasks(prevTasks => prevTasks.map(t =>
            t.id === task.id ? { ...t, downloadUrl, isFetchingLink: false } : t
        ));
     } catch(e) {
        setTasks(prevTasks => prevTasks.map(t =>
            t.id === task.id ? { ...t, isFetchingLink: false, message: "Failed to get download link." } : t
        ));
     }
  }, [token]);

  const refreshTasks = useCallback(async () => {
    if (!token) return;
    try {
        const { tasks: fetchedTasks } = await pikpakService.getTasks(token);
        
        // Naive merge strategy: update existing, add new
        setTasks(currentTasks => {
            const taskMap = new Map<string, Task>();
            
            // Add current tasks to map, preserving frontend state like downloadUrl
            currentTasks.forEach(task => taskMap.set(task.id, task));
            
            // Update with fetched tasks
            fetchedTasks.forEach(fetchedTask => {
                const existingTask = taskMap.get(fetchedTask.id);
                taskMap.set(fetchedTask.id, { ...existingTask, ...fetchedTask });
            });
            
            return Array.from(taskMap.values()).sort((a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime());
        });
    } catch (error) {
        console.error("Failed to refresh tasks", error);
        // Could handle token expiration here
    }
  }, [token]);

  useEffect(() => {
      if (isAuthenticated) {
          refreshTasks(); // Initial fetch
          const interval = setInterval(refreshTasks, 5000); // Poll every 5 seconds
          return () => clearInterval(interval);
      }
  }, [isAuthenticated, refreshTasks]);

  useEffect(() => {
    if (error) {
        const timer = setTimeout(() => setError(null), 5000);
        return () => clearTimeout(timer);
    }
  }, [error]);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="relative flex items-center justify-between mb-10">
           <div className="text-left">
             <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
               PikPak Magnet Linker
             </h1>
             <p className="mt-2 text-gray-400 max-w-2xl">
              Add a magnet link to begin downloading to your cloud.
            </p>
           </div>
           <button
              onClick={handleLogout}
              className="flex-shrink-0 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-4 py-2 rounded-md transition-colors text-sm"
            >
              Logout
            </button>
        </header>

        <main>
          <div className="bg-transparent border border-gray-800 shadow-xl shadow-black/20 rounded-lg p-6 mb-8">
            <MagnetForm onSubmit={handleAddTask} isLoading={isSubmitting} />
            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
          </div>

          <div className="space-y-4">
             <h2 className="text-2xl font-semibold text-gray-100 border-b-2 border-gray-800 pb-2">Your Tasks</h2>
             <TaskList tasks={tasks} onGetLink={handleGetDownloadLink} />
          </div>
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>Built with a Vercel-powered backend.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
