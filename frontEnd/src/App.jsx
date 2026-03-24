import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');

  // 백엔드 서버 주소
  const API_URL = import.meta.env.PROD ? '/api/todos' : 'http://localhost:5000/api/todos';

  // 1. 처음 화면 켜질 때 DB에서 데이터 불러오기 (GET)
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

  // 2. 새로운 Todo 추가하기 (POST)
  const addTodo = async (e) => {
    e.preventDefault(); // 폼 제출 시 새로고침 방지
    if (!inputText.trim()) return; // 빈칸 방지
    
    try {
      const res = await axios.post(API_URL, { title: inputText });
      setTodos([...todos, res.data]); // 기존 목록에 새거 추가
      setInputText(''); // 입력창 비우기
    } catch (error) {
      console.error('추가 실패:', error);
    }
  };

  // 3. 체크박스 클릭 시 완료 상태 변경 (PUT)
  const toggleTodo = async (id, completed) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, { completed: !completed });
      // 상태 업데이트: 클릭한 항목만 백엔드에서 온 데이터로 교체
      setTodos(todos.map(todo => (todo._id === id ? res.data : todo)));
    } catch (error) {
      console.error('수정 실패:', error);
    }
  };

  // 4. 삭제 버튼 클릭 시 지우기 (DELETE)
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(todos.filter(todo => todo._id !== id)); // 삭제한 항목 빼고 새로고침
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  // 화면 디자인 (Tailwind CSS 적용)
  return (
    <div className="min-h-screen bg-gray-100 py-10 flex justify-center">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 h-fit">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">내 할 일 목록 📝</h1>
        
        {/* 입력 폼 */}
        <form onSubmit={addTodo} className="flex mb-6">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 border-2 border-gray-300 rounded-l-lg p-3 outline-none focus:border-blue-500 transition-colors"
            placeholder="할 일을 입력하세요..."
          />
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-5 rounded-r-lg hover:bg-blue-700 transition-colors font-bold"
          >
            추가
          </button>
        </form>

        {/* 할 일 목록 */}
        <ul className="space-y-3">
          {todos.map((todo) => (
            <li key={todo._id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center cursor-pointer" onClick={() => toggleTodo(todo._id, todo.completed)}>
                {/* 체크박스 */}
                <input 
                  type="checkbox" 
                  checked={todo.completed} 
                  readOnly
                  className="w-5 h-5 text-blue-600 cursor-pointer mr-3"
                />
                {/* 제목 (완료 시 취소선) */}
                <span className={`text-lg ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {todo.title}
                </span>
              </div>
              {/* 삭제 버튼 */}
              <button 
                onClick={() => deleteTodo(todo._id)}
                className="text-red-500 hover:text-red-700 font-bold p-2"
              >
                삭제
              </button>
            </li>
          ))}
          {/* 할 일이 없을 때 */}
          {todos.length === 0 && (
            <p className="text-center text-gray-500 mt-4">아직 등록된 할 일이 없습니다.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;