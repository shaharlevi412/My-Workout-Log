import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
const API_URL = "https://fitness-backend-0dzi.onrender.com";

const EXERCISE_OPTIONS = [
  { name: "Push Ups", muscle: "Chest" },
  { name: "Pull Ups", muscle: "Back" },
  { name: "Squat", muscle: "Legs" },
  { name: "Plank", muscle: "Core" },
  { name: "Bicep Curls", muscle: "Arms" }
];

function App() {
  const [exercises, setExercises] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('workout');
  
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState('')
  const [muscle, setMuscle] = useState('')
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [currentWorkout, setCurrentWorkout] = useState([]);

  const fetchExercises = async () => {
    try {
      const res = await axios.get('${API_URL}/api/exercises')
      setExercises(res.data)
    } catch (err) {
      console.error("Error fetching:", err)
    }
  }

  useEffect(() => {
    fetchExercises()
  }, [])

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (val === "custom") {
      setIsCustom(true);
      setName(''); setMuscle('');
    } else if (val === "") {
      setIsCustom(false);
      setName(''); setMuscle('');
    } else {
      setIsCustom(false);
      const selected = EXERCISE_OPTIONS.find(ex => ex.name === val);
      setName(selected.name);
      setMuscle(selected.muscle);
    }
  };

  const addRowToTable = (e) => {
    e.preventDefault();
    if (!name || !muscle) return alert("נא לבחור תרגיל ושריר");

    const newRow = {
      id: Date.now(),
      workoutDate,
      name,
      muscle,
      sets: sets || 0,
      reps: reps || 0,
      weight: weight || 0
    };

    setCurrentWorkout([...currentWorkout, newRow]);
    setName(''); setSets(''); setReps(''); setWeight('');
  };

  const saveEntireWorkout = async () => {
    if (currentWorkout.length === 0) return;
    try {
      const promises = currentWorkout.map(ex => 
        axios.post('${API_URL}/api/exercises', {
          name: ex.name,
          muscle: ex.muscle,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          date: ex.workoutDate
        })
      );
      await Promise.all(promises);
      alert("האימון נשמר בהצלחה!");
      setCurrentWorkout([]);
      setShowForm(false);
      fetchExercises();
    } catch (err) {
      console.error("Error saving:", err);
    }
  };

  const deleteWorkoutByDate = async (rawDate) => {
    if (!window.confirm(`האם למחוק את כל האימון של תאריך ${new Date(rawDate).toLocaleDateString('he-IL')}?`)) return;
    try {
      await axios.delete(`${API_URL}/api/exercises/by-date/${rawDate}`);
      fetchExercises();
    } catch (err) {
      console.error("Error deleting:", err);
      alert("שגיאה במחיקה");
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>תכנית האימונים שלי</h1>
      </header>

      <nav className="tabs-nav">
        <button className={activeTab === 'workout' ? 'tab active' : 'tab'} onClick={() => setActiveTab('workout')}>🏋️ אימון חדש</button>
        <button className={activeTab === 'history' ? 'tab active' : 'tab'} onClick={() => setActiveTab('history')}>📜 היסטוריה</button>
      </nav>

      <main className="main-content">
        {activeTab === 'workout' && (
          <section className="workout-view">
            {!showForm ? (
              <div className="welcome-screen">
                <button className="add-workout-btn" onClick={() => setShowForm(true)}>➕ הוסף אימון חדש</button>
              </div>
            ) : (
              <div className="workout-container">
                <div className="workout-card">
                  <h2>רישום אימון</h2>
                  <form onSubmit={addRowToTable} className="excel-table">
                    <div className="table-header">
                      <span>תאריך</span><span>תרגיל</span><span>סטים</span><span>חזרות</span><span>משקל</span><span></span>
                    </div>
                    {currentWorkout.map((row) => (
                      <div key={row.id} className="table-row added-row">
                        <span>{row.workoutDate}</span>
                        <span>{row.name}</span>
                        <span>{row.sets}</span>
                        <span>{row.reps}</span>
                        <span>{row.weight}kg</span>
                        <button type="button" className="remove-row-btn" onClick={() => setCurrentWorkout(currentWorkout.filter(r => r.id !== row.id))}>❌</button>
                      </div>
                    ))}
                    <div className="table-row input-row">
                      <input type="date" value={workoutDate} onChange={(e) => setWorkoutDate(e.target.value)} />
                      <select value={isCustom ? "custom" : name} onChange={handleSelectChange}>
                        <option value="">בחר...</option>
                        {EXERCISE_OPTIONS.map((opt, i) => <option key={i} value={opt.name}>{opt.name}</option>)}
                        <option value="custom">אחר...</option>
                      </select>
                      <input type="number" placeholder="סטים" value={sets} onChange={(e)=>setSets(e.target.value)} />
                      <input type="number" placeholder="חזרות" value={reps} onChange={(e)=>setReps(e.target.value)} />
                      <input type="number" placeholder="משקל" value={weight} onChange={(e)=>setWeight(e.target.value)} />
                      <button type="submit" className="add-row-btn">V</button>
                    </div>
                    {isCustom && (
                      <div className="custom-row">
                        <input placeholder="שם תרגיל" value={name} onChange={(e)=>setName(e.target.value)} />
                        <input placeholder="שריר" value={muscle} onChange={(e)=>setMuscle(e.target.value)} />
                      </div>
                    )}
                  </form>
                  <div className="workout-actions">
                    {currentWorkout.length > 0 && <button className="final-save-btn" onClick={saveEntireWorkout}>💾 שמור אימון מלא</button>}
                    <button className="close-btn" onClick={() => {setShowForm(false); setCurrentWorkout([]);}}>ביטול</button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'history' && (
          <section className="history-view">
            <h2>יומן אימונים</h2>
            {Object.entries(exercises.reduce((groups, ex) => {
                const d = new Date(ex.date);
                const rawDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const displayDate = d.toLocaleDateString('he-IL');
                if (!groups[rawDate]) groups[rawDate] = { display: displayDate, items: [] };
                groups[rawDate].items.push(ex);
                return groups;
              }, {})
            ).map(([dateKey, group]) => (
              <div key={dateKey} className="history-day-section">
                <div className="history-header-flex">
                  <h3 className="history-date-title">📅 {group.display}</h3>
                  <button className="delete-workout-btn" onClick={() => deleteWorkoutByDate(dateKey)}>🗑️ מחק אימון</button>
                </div>
                <div className="history-table">
                  <div className="history-table-header"><span>תרגיל</span><span>סטים</span><span>חזרות</span><span>משקל</span></div>
                  {group.items.map((ex) => (
                    <div key={ex._id} className="history-table-row">
                      <span className="ex-name">{ex.name}</span>
                      <span>{ex.sets}</span><span>{ex.reps}</span><span>{ex.weight}kg</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;