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
    <div className="min-h-screen bg-slate-100 py-6 px-4 md:py-10 flex justify-center">
      
      <div className="bg-white w-full max-w-lg md:max-w-2xl rounded-3xl shadow-2xl p-6 md:p-10 h-fit relative">
        
        <div className="text-center md:text-right md:absolute md:top-6 md:right-8 mb-6 md:mb-0">
          <p className="text-xs md:text-sm font-bold text-cyan-800">{currentTime.toLocaleDateString('ko-KR')}</p>
          <p className="text-xl md:text-2xl font-black text-slate-700 font-mono tracking-tighter">
            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
          </p>
        </div>

        <div className="flex flex-col items-center mb-6 pb-6 border-b-2 border-slate-100 md:mt-4">
          <img src={logo} alt="창원대학교 로고" className="h-14 md:h-16 mb-4" />
          {/* 타이틀 글자 크기 조정 */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-center text-slate-900">
            나의 할 일 목록 📝
          </h1>
          <p className="text-lg md:text-xl font-medium text-slate-600 mt-3">
            남은 할 일: <span className="text-cyan-700 font-bold">{remainingTodos}</span>개
          </p>
        </div>
        
        <form onSubmit={addTodo} className="flex flex-col mb-8 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner">
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 border-2 border-slate-300 rounded-xl p-3 text-lg outline-none focus:border-cyan-700 transition-colors shadow-inner w-full"
              placeholder="오늘의 중요한 일을 입력하세요..."
            />
            {/* 추가 버튼: 모바일에서는 `w-full`로 한 줄 꽉 차게 변경 */}
            <button 
              type="submit" 
              className="bg-cyan-700 text-white p-3 sm:px-8 rounded-xl hover:bg-cyan-800 transition-colors font-bold text-lg active:scale-95 shadow-md shrink-0 w-full sm:w-auto"
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
                className="border-2 border-slate-300 rounded-lg p-1 px-3 outline-none focus:border-cyan-700 text-slate-700 w-auto"
              />
            )}
          </div>
        </form>

        <ul className="space-y-4">
          {todos.map((todo) => {
            const dDayInfo = calculateDday(todo.dueDate);
            return (
              <li key={todo._id} className="flex flex-col bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-lg transition-shadow">
                
                <div className="flex flex-col sm:flex-row justify-between items-start w-full gap-3 sm:gap-0">
                  {editingId === todo._id ? (
                    // [수정 모드 화면]
                    <div className="flex-1 flex gap-2 w-full">
                      <input 
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 border-2 border-cyan-500 rounded-xl p-2 text-lg outline-none w-full"
                        autoFocus
                      />
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => saveEdit(todo._id)} className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-600 active:scale-95 text-sm md:text-base">저장</button>
                        <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-4 py-2 rounded-xl font-bold hover:bg-gray-500 active:scale-95 text-sm md:text-base">취소</button>
                      </div>
                    </div>
                  ) : (
                    // [기본 모드 화면]
                    <>
                      <div className="flex items-center flex-1 break-all w-full">
                        <input 
                          type="checkbox" 
                          checked={todo.completed} 
                          onChange={() => toggleTodo(todo._id, todo.completed)} 
                          className="w-6 h-6 text-cyan-700 cursor-pointer mr-4 accent-cyan-700 shrink-0"
                        />
                        <div className="flex flex-col w-full">
                          <div className="flex items-center gap-2 flex-wrap">
                            {dDayInfo && !todo.completed && (
                              <span className={`${dDayInfo.color} text-white text-xs md:text-sm font-extrabold px-3 py-1.5 rounded-lg tracking-wide shrink-0`}>
                                {dDayInfo.text}
                              </span>
                            )}
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xl font-semibold ${todo.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {todo.title}
                              </span>
                              {todo.completed && (
                                <span className="text-xs font-extrabold text-emerald-600 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg shadow-sm animate-pulse shrink-0">
                                  🎉 완료!
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      
                      <div className="flex gap-2 sm:ml-4 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                        <button onClick={() => startEdit(todo)} className="text-cyan-700 hover:text-cyan-900 font-bold p-2 px-3 text-sm active:scale-90 bg-cyan-100 rounded-lg">수정</button>
                        <button onClick={() => deleteTodo(todo._id)} className="text-red-500 hover:text-red-700 font-bold p-2 px-3 text-sm active:scale-90 bg-red-100 rounded-lg">삭제</button>
                      </div>
                    </>
                  )}
                </div>

                
                <div className="mt-3 text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1 pl-10">
                  {todo.createdAt && <p>등록: {formatDate(todo.createdAt)}</p>}
                  {todo.editedAt && (
                    <p className="text-cyan-600">수정: {formatDate(todo.editedAt)}</p>
                  )}
                </div>
              </li>
            );
          })}
          {todos.length === 0 && (
            <div className="text-center py-10 px-4">
              <p className="text-slate-500 mt-2 text-base md:text-lg">아직 등록된 할 일이 없습니다.</p>
              <p className="text-slate-400 text-sm mt-1">새로운 목표를 추가해 보세요!</p>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;