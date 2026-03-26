import { useState, useEffect } from 'react';
import axios from 'axios';
import logo from './assets/logo.png'; 

function App() {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const [currentTime, setCurrentTime] = useState(new Date());
  const [useDday, setUseDday] = useState(false); 
  const [dDayDate, setDdayDate] = useState(''); 

  const API_URL = import.meta.env.PROD ? '/api/todos' : 'http://localhost:5000/api/todos';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await axios.get(API_URL);
      setTodos(res.data);
    } catch (error) {
      console.error('데이터 불러오기 실패:', error);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault(); 
    if (!inputText.trim()) return;
    
    const newTodoData = { 
      title: inputText,
      dueDate: useDday && dDayDate ? dDayDate : null 
    };

    try {
      const res = await axios.post(API_URL, newTodoData);
      setTodos([...todos, res.data]); 
      setInputText(''); 
      setUseDday(false); 
      setDdayDate('');
    } catch (error) {
      console.error('추가 실패:', error);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, { completed: !completed });
      setTodos(todos.map(todo => (todo._id === id ? res.data : todo)));
    } catch (error) {
      console.error('상태 변경 실패:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(todos.filter(todo => todo._id !== id)); 
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo._id); 
    setEditText(todo.title); 
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return; 
    try {
      const res = await axios.put(`${API_URL}/${id}`, { 
        title: editText,
        editedAt: new Date()
      });
      setTodos(todos.map(todo => (todo._id === id ? res.data : todo)));
      setEditingId(null); 
    } catch (error) {
      console.error('수정 저장 실패:', error);
    }
  };

  const calculateDday = (targetDate) => {
    if (!targetDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return { text: '🔥 D-Day!', color: 'bg-red-600 ring-4 ring-red-200 animate-pulse' };
    if (diffDays > 0) return { text: `D-${diffDays}`, color: 'bg-cyan-600 shadow-md border-2 border-cyan-200' };
    return { text: `D+${Math.abs(diffDays)}`, color: 'bg-gray-500 opacity-80' }; 
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const remainingTodos = todos.filter(todo => !todo.completed).length;

  return (
    <div className="min-h-screen bg-slate-100 py-10 flex justify-center">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 h-fit relative">
        
        <div className="absolute top-6 right-8 text-right">
          <p className="text-sm font-bold text-cyan-800">{currentTime.toLocaleDateString('ko-KR')}</p>
          <p className="text-2xl font-black text-slate-700 font-mono tracking-tighter">
            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
          </p>
        </div>

        <div className="flex flex-col items-center mb-10 pb-6 border-b-2 border-slate-100 mt-4">
          <img src={logo} alt="창원대학교 로고" className="h-16 mb-4" />
          <h1 className="text-4xl font-extrabold text-center text-slate-900">
            나의 할 일 목록 📝
          </h1>
          <p className="text-xl font-medium text-slate-600 mt-4">
            남은 할 일: <span className="text-cyan-700 font-bold">{remainingTodos}</span>개
          </p>
        </div>
        
        <form onSubmit={addTodo} className="flex flex-col mb-8 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex gap-3">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 border-2 border-slate-300 rounded-xl p-3 text-lg outline-none focus:border-cyan-700 transition-colors shadow-inner"
              placeholder="오늘의 중요한 일을 입력하세요..."
            />
            <button 
              type="submit" 
              className="bg-cyan-700 text-white px-8 rounded-xl hover:bg-cyan-800 transition-colors font-bold text-lg active:scale-95 shadow-md shrink-0"
            >
              추가
            </button>
          </div>
          
          <div className="flex items-center gap-3 mt-2 pl-2">
            <label className="flex items-center cursor-pointer text-slate-600 font-medium">
              <input 
                type="checkbox" 
                checked={useDday}
                onChange={(e) => setUseDday(e.target.checked)}
                className="w-5 h-5 mr-2 accent-cyan-700 cursor-pointer"
              />
              D-Day 설정하기
            </label>
            {useDday && (
              <input 
                type="date" 
                value={dDayDate}
                onChange={(e) => setDdayDate(e.target.value)}
                className="border-2 border-slate-300 rounded-lg p-1 px-3 outline-none focus:border-cyan-700 text-slate-700"
              />
            )}
          </div>
        </form>

        <ul className="space-y-4">
          {todos.map((todo) => {
            const dDayInfo = calculateDday(todo.dueDate);
            return (
              <li key={todo._id} className="flex flex-col bg-slate-50 p-5 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-lg transition-shadow">
                
                <div className="flex justify-between items-start w-full">
                  {editingId === todo._id ? (
                    <div className="flex-1 flex gap-2 mr-2">
                      <input 
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 border-2 border-cyan-500 rounded-xl p-2 text-lg outline-none"
                        autoFocus
                      />
                      <button onClick={() => saveEdit(todo._id)} className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-600 active:scale-95 shrink-0">저장</button>
                      <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-4 py-2 rounded-xl font-bold hover:bg-gray-500 active:scale-95 shrink-0">취소</button>
                    </div>
                  ) : (
                    <>
                      {/* 👇 여기서 부모 div의 클릭 이벤트를 빼고 텍스트 커서 모양을 기본으로 바꿨습니다! */}
                      <div className="flex items-center flex-1 break-all">
                        {/* 👇 클릭 이벤트(onChange)를 오직 이 체크박스에만 부여했습니다! */}
                        <input 
                          type="checkbox" 
                          checked={todo.completed} 
                          onChange={() => toggleTodo(todo._id, todo.completed)} 
                          className="w-6 h-6 text-cyan-700 cursor-pointer mr-4 accent-cyan-700 shrink-0"
                        />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-3 flex-wrap">
                            {dDayInfo && !todo.completed && (
                              <span className={`${dDayInfo.color} text-white text-sm font-extrabold px-3 py-1.5 rounded-lg tracking-wide`}>
                                {dDayInfo.text}
                              </span>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <span className={`text-xl font-semibold ${todo.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {todo.title}
                              </span>
                              {todo.completed && (
                                <span className="text-sm font-extrabold text-emerald-600 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg shadow-sm animate-pulse">
                                  🎉 완료!
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4 shrink-0">
                        <button onClick={() => startEdit(todo)} className="text-cyan-700 hover:text-cyan-900 font-bold p-2 text-sm active:scale-90 bg-cyan-100 rounded-lg">수정</button>
                        <button onClick={() => deleteTodo(todo._id)} className="text-red-500 hover:text-red-700 font-bold p-2 text-sm active:scale-90 bg-red-100 rounded-lg">삭제</button>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-3 text-xs text-slate-400 flex gap-4 pl-10">
                  {todo.createdAt && <p>등록: {formatDate(todo.createdAt)}</p>}
                  {todo.editedAt && (
                    <p className="text-cyan-600">수정: {formatDate(todo.editedAt)}</p>
                  )}
                </div>
              </li>
            );
          })}
          {todos.length === 0 && (
            <div className="text-center py-10">
              <p className="text-slate-500 mt-2 text-lg">아직 등록된 할 일이 없습니다.</p>
              <p className="text-slate-400 text-sm mt-1">새로운 목표를 추가해 보세요!</p>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;