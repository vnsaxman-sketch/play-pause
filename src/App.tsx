import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";

type Session = {
  id: string;
  date: string;
  startMoney: number;
  endMoney: number;
  minutes: number;
  note: string;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function App() {
  const [weeklyLimit, setWeeklyLimit] = useState(500);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [startMoney, setStartMoney] = useState("");
  const [endMoney, setEndMoney] = useState("");
  const [minutes, setMinutes] = useState("");
  const [note, setNote] = useState("");

  const totalLoss = useMemo(() => {
    return sessions.reduce((total, session) => {
      const result = session.endMoney - session.startMoney;
      return result < 0 ? total + Math.abs(result) : total;
    }, 0);
  }, [sessions]);

  const remaining = Math.max(weeklyLimit - totalLoss, 0);
  const limitReached = totalLoss >= weeklyLimit;

  function addSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const start = Number(startMoney);
    const end = Number(endMoney);
    const sessionMinutes = Number(minutes);

    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      !Number.isFinite(sessionMinutes) ||
      start < 0 ||
      end < 0 ||
      sessionMinutes <= 0
    ) {
      alert("Please enter valid amounts and a session length.");
      return;
    }

    const newSession: Session = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleDateString(),
      startMoney: start,
      endMoney: end,
      minutes: sessionMinutes,
      note: note.trim(),
    };

    setSessions((currentSessions) => [newSession, ...currentSessions]);
    setStartMoney("");
    setEndMoney("");
    setMinutes("");
    setNote("");
  }

  function deleteSession(id: string) {
    setSessions((currentSessions) =>
      currentSessions.filter((session) => session.id !== id),
    );
  }

  return (
    <main className="app">
      <header>
        <p className="eyebrow">PRIVATE MONEY CHECK</p>
        <h1>PlayPause</h1>
	<p className="subtitle">
          Developed by: Long Nguyen
        </p>
        <p className="subtitle">
          This app does not predict wins. It helps you control your time and
          money.
        </p>
      </header>

      <section className={limitReached ? "warning card" : "card"}>
        <h2>Your weekly limit</h2>

        <label>
          Most you can afford to lose this week
          <input
            type="number"
            min="0"
            step="1"
            value={weeklyLimit}
            onChange={(event) => setWeeklyLimit(Number(event.target.value))}
          />
        </label>

        <div className="numbers">
          <div>
            <span>Lost this week</span>
            <strong>{money(totalLoss)}</strong>
          </div>
          <div>
            <span>Left in your limit</span>
            <strong>{money(remaining)}</strong>
          </div>
        </div>

        {limitReached ? (
          <p className="message">
            You reached your weekly limit. Stop gambling for this week.
          </p>
        ) : (
          <p className="message safe">
            You have {money(remaining)} left in your weekly limit.
          </p>
        )}
      </section>

      <section className="card">
        <h2>Add a session</h2>

        <form onSubmit={addSession}>
          <label>
            Starting money
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="100"
              value={startMoney}
              onChange={(event) => setStartMoney(event.target.value)}
              required
            />
          </label>

          <label>
            Ending money
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="40"
              value={endMoney}
              onChange={(event) => setEndMoney(event.target.value)}
              required
            />
          </label>

          <label>
            Minutes played
            <input
              type="number"
              min="1"
              placeholder="60"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
              required
            />
          </label>

          <label>
            Optional note
            <input
              type="text"
              maxLength={80}
              placeholder="Example: Casino visit"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>

          <button type="submit">Save session</button>
        </form>
      </section>

      <section className="card">
        <h2>Your sessions</h2>

        {sessions.length === 0 ? (
          <p>No sessions yet. Add your first session above.</p>
        ) : (
          <div className="session-list">
            {sessions.map((session) => {
              const result = session.endMoney - session.startMoney;
              const resultText =
                result >= 0 ? `Won ${money(result)}` : `Lost ${money(-result)}`;

              return (
                <article className="session" key={session.id}>
                  <div>
                    <strong>{resultText}</strong>
                    <p>
                      {session.date} · {session.minutes} minutes
                      {session.note ? ` · ${session.note}` : ""}
                    </p>
                  </div>
                  <button
                    className="delete-button"
                    type="button"
                    onClick={() => deleteSession(session.id)}
                  >
                    Delete
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

