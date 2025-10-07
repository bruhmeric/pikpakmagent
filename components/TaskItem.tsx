import React, { useState } from 'react';
import { Task } from '../types';
import { SpinnerIcon, CheckCircleIcon, ArrowDownTrayIcon, ClipboardIcon } from './icons';

interface TaskItemProps {
  task: Task;
  onGetLink: (task: Task) => void;
}

const TaskStatusBadge: React.FC<{ phase: Task['phase'], message: string }> = ({ phase, message }) => {
  switch (phase) {
    case 'PHASE_TYPE_RUNNING':
    case 'PHASE_TYPE_PENDING':
      return (
        <div className="flex items-center gap-2 text-yellow-400">
          <SpinnerIcon className="animate-spin h-4 w-4" />
          <span className="text-sm font-medium">Processing</span>
        </div>
      );
    case 'PHASE_TYPE_COMPLETE':
      return (
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircleIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Completed</span>
        </div>
      );
    case 'PHASE_TYPE_ERROR':
       return (
        <div className="flex items-center gap-2 text-red-400">
          <span className="text-sm font-medium" title={message}>Error</span>
        </div>
       );
    default:
      return null;
  }
};

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-3 py-1.5 rounded-md transition-colors"
        >
           {copied ? <CheckCircleIcon className="h-4 w-4 text-emerald-400" /> : <ClipboardIcon className="h-4 w-4" />}
           {copied ? 'Copied!' : 'Copy'}
        </button>
    )
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onGetLink }) => {

  const handleGetLinkClick = () => {
    if(!task.isFetchingLink && task.phase === 'PHASE_TYPE_COMPLETE') {
      onGetLink(task);
    }
  }

  const displayName = task.file_name || task.name;

  return (
    <div className="bg-gray-950/70 border border-gray-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-gray-900">
      <div className="flex-1 min-w-0">
        <p className="text-gray-300 truncate text-sm" title={displayName}>
            {displayName}
        </p>
        <div className="mt-2">
            <TaskStatusBadge phase={task.phase} message={task.message} />
        </div>
        {task.phase === 'PHASE_TYPE_ERROR' && <p className="text-red-400 text-sm mt-2">{task.message}</p>}
      </div>
      <div className="flex-shrink-0">
        {task.phase === 'PHASE_TYPE_COMPLETE' && !task.downloadUrl && (
          <button
            onClick={handleGetLinkClick}
            disabled={task.isFetchingLink}
            className="flex items-center justify-center gap-2 w-full md:w-auto bg-white text-black font-semibold px-4 py-2 rounded-md hover:bg-gray-200 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {task.isFetchingLink ? (
              <>
                <SpinnerIcon className="animate-spin h-5 w-5" />
                Fetching...
              </>
            ) : (
               <>
                <ArrowDownTrayIcon className="h-5 w-5" />
                Get Link
               </>
            )}
          </button>
        )}
        {task.downloadUrl && (
          <div className='flex flex-col sm:flex-row sm:items-center gap-3 bg-black p-3 rounded-md border border-gray-800'>
            <a
              href={task.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 text-sm truncate underline flex-1"
            >
              {task.downloadUrl}
            </a>
            <CopyButton textToCopy={task.downloadUrl} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
