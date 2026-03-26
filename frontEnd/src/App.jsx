import { useState, useEffect } from 'react';
import axios from 'axios';
import logo from './assets/logo.png'; 

function App() {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');

  const API_URL = import.meta.env.PROD ? '/api/todos' : 'http://localhost:5000/api/todos';

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
    
    try {
      const res = await axios.post(API_URL, { title: inputText });
      setTodos([...todos, res.data]); 
      setInputText(''); 
    } catch (error) {
      console.error('추가 실패:', error);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, { completed: !completed });
      setTodos(todos.map(todo => (todo._id === id ? res.data : todo)));
    } catch (error) {
      console.error('수정 실패:', error);
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

  // 👇 [편의 기능] 남은 할 일 개수 계산
  const remainingTodos = todos.filter(todo => !todo.completed).length;

  return (
    // 전체 배경: 연한 네이비 그레이 (테마 변경)
    <div className="min-h-screen bg-slate-100 py-10 flex justify-center">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 h-fit">
        
        {/* 👇 [창원대 디자인] 상단 로고 & 타이틀 */}
        <div className="flex flex-col items-center mb-10 pb-6 border-b-2 border-slate-100">
          <img src={logo} alt="창원대학교 로고" className="h-16 mb-4" />
          <h1 className="text-4xl font-extrabold text-center text-slate-900">
            나의 할 일 목록 📝
          </h1>
          {/* 👇 [편의 기능] 진행 상황 카운터 */}
          <p className="text-xl font-medium text-slate-600 mt-4">
            남은 할 일: {remainingTodos}개
          </p>
        </div>
        
        {/* 입력 폼: 엔터키 자동 지원됨 (form 태그 덕분) */}
        <form onSubmit={addTodo} className="flex mb-8 gap-3">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            // 입력창 디자인: 창원대 블루 계열 적용
            className="flex-1 border-2 border-slate-200 rounded-2xl p-4 text-lg outline-none focus:border-cyan-700 transition-colors shadow-inner"
            placeholder="오늘의 중요한 일을 입력하세요..."
          />
          <button 
            type="submit" 
            // 버튼 색상 변경: 밝은 파랑 -> 창원대 상징색(청록색/딥블루)
            className="bg-cyan-700 text-white px-8 rounded-2xl hover:bg-cyan-800 transition-colors font-bold text-lg active:scale-95 transform shadow-md"
          >
            추가
          </button>
        </form>

        {/* 할 일 목록 */}
        <ul className="space-y-4">
          {todos.map((todo) => (
            <li key={todo._id} className="flex items-center justify-between bg-slate-50 p-5 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center cursor-pointer" onClick={() => toggleTodo(todo._id, todo.completed)}>
                <input 
                  type="checkbox" 
                  checked={todo.completed} 
                  readOnly
                  // 체크박스 색상 변경
                  className="w-6 h-6 text-cyan-700 cursor-pointer mr-5 accent-cyan-700"
                />
                <span className={`text-xl ${todo.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {todo.title}
                </span>
              </div>
              <button 
                onClick={() => deleteTodo(todo._id)}
                className="text-red-500 hover:text-red-700 font-bold p-2 text-lg active:scale-90"
              >
                삭제
              </button>
            </li>
          ))}
          {todos.length === 0 && (
            <p className="text-center text-slate-500 mt-8 text-lg">아직 등록된 할 일이 없습니다.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;