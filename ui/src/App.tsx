import { useState, useEffect } from 'react';

interface User { id: number; login: string }

export default function App() {
  const [login, setLogin] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const es = new EventSource('http://localhost:3002/sse');
    es.onmessage = e => setUsers(prev => {
      const u = JSON.parse(e.data);
      return prev.some(x => x.id === u.id) ? prev : [...prev, u];
    });
    return () => es.close();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login.trim()) return;
    setBusy(true);
    await fetch('http://localhost:3001/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login })
    });
    setLogin(''); setBusy(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex gap-8">
      <form onSubmit={submit} className="w-1/3 bg-white p-6 rounded shadow h-fit">
        <h2 className="text-xl font-bold mb-4">Новый пользователь</h2>
        <input className="w-full p-2 border rounded mb-4" placeholder="Введите Login" value={login} onChange={e => setLogin(e.target.value)} required />
        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={busy}>
          {busy ? 'Отправка...' : 'Добавить'}
        </button>
      </form>
      <div className="w-2/3 bg-white p-6 rounded shadow overflow-auto">
        <h2 className="text-xl font-bold mb-4">Список</h2>
        <table className="w-full text-left">
          <thead><tr className="border-b"><th className="p-2">ID</th><th className="p-2">Login</th></tr></thead>
          <tbody>{users.map(u => <tr key={u.id} className="border-b"><td className="p-2">{u.id}</td><td className="p-2">{u.login}</td></tr>)}</tbody>
        </table>
        {!users.length && <p className="text-gray-500 mt-4">Ожидание данных...</p>}
      </div>
    </div>
  );
}