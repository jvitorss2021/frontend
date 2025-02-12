"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/axios";
import { useRouter, useParams } from "next/navigation";
import Loading from "../../components/Loading";

type Workout = {
  id: number;
  name: string;
  exercises: string;
  userId: number;
  createdAt: string;
};

export default function EditWorkout() {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<string[]>([]);
  const [newExercise, setNewExercise] = useState("");
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<
    number | null
  >(null);
  const [editingExerciseText, setEditingExerciseText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchWorkout = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await api.get(`/workouts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWorkout(response.data);
        setName(response.data.name);
        setExercises(JSON.parse(response.data.exercises));
      } catch (error) {
        console.error("Failed to fetch workout", error);
        setError("Failed to fetch workout");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [id]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await api.put(
        `/workouts/${id}`,
        { name, exercises: JSON.stringify(exercises) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save workout", error);
      setError("Failed to save workout");
    }
  };

  const handleAddExercise = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await api.post(
        `/workouts/${id}/exercises`,
        { exercise: newExercise },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setExercises(JSON.parse(response.data.exercises));
      setNewExercise("");
    } catch (error) {
      console.error("Failed to add exercise", error);
      setError("Failed to add exercise");
    }
  };

  const handleDeleteExercise = (index: number) => {
    const updatedExercises = exercises.filter((_, i) => i !== index);
    setExercises(updatedExercises);
  };

  const handleEditExercise = (index: number) => {
    setEditingExerciseIndex(index);
    setEditingExerciseText(exercises[index]);
  };

  const handleSaveEditedExercise = () => {
    if (editingExerciseIndex !== null) {
      const updatedExercises = exercises.map((exercise, index) =>
        index === editingExerciseIndex ? editingExerciseText : exercise
      );
      setExercises(updatedExercises);
      setEditingExerciseIndex(null);
      setEditingExerciseText("");
    }
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return <Loading />;
  }

  if (!workout) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <h1 className="text-3xl mb-6 text-primary">Edit Workout</h1>
      <div className="bg-base-100 p-6 rounded shadow-md w-full max-w-sm">
        {error && <div className="alert alert-error mb-4">{error}</div>}
        <div className="mb-4">
          <label className="block text-primary text-sm">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input input-bordered w-full text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-primary text-sm">Exercises</label>
          <ul className="text-sm">
            {exercises.map((exercise, index) => (
              <li
                key={index}
                className="flex justify-between items-center mb-2 p-2 bg-base-100 rounded"
              >
                {editingExerciseIndex === index ? (
                  <input
                    type="text"
                    value={editingExerciseText}
                    onChange={(e) => setEditingExerciseText(e.target.value)}
                    onBlur={handleSaveEditedExercise}
                    className="input input-bordered w-full text-sm"
                  />
                ) : (
                  <span onClick={() => handleEditExercise(index)}>
                    {exercise}
                  </span>
                )}
                <button
                  onClick={() => handleDeleteExercise(index)}
                  className="btn btn-error btn-xs"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <input
            type="text"
            value={newExercise}
            onChange={(e) => setNewExercise(e.target.value)}
            className="input input-bordered w-full text-sm mt-2"
            placeholder="Add new exercise"
          />
          <button
            onClick={handleAddExercise}
            className="btn btn-primary mt-2 text-sm"
          >
            Add
          </button>
        </div>
        <div className="flex justify-between">
          <button onClick={handleBack} className="btn btn-secondary text-sm">
            Back
          </button>
          <button onClick={handleSave} className="btn btn-success text-sm">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
