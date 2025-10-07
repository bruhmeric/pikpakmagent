import React from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onGetLink: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onGetLink }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 px-4 border-2 border-dashed border-gray-800 rounded-lg">
        <h3 className="text-gray-400 font-semibold">No tasks yet</h3>
        <p className="text-gray-500 mt-1">Add a magnet link to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onGetLink={onGetLink} />
      ))}
    </div>
  );
};

export default TaskList;
