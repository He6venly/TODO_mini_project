require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// mongoose.connect(process.env.MONGODB_URI, {family: 4})
//   .then(() => console.log('MongoDB 연결 성공'))
//   .catch(err => console.log(err));

const uri = 'mongodb://He6venly:skeowlak56@ac-7ppebxj-shard-00-00.3gywuhh.mongodb.net:27017,ac-7ppebxj-shard-00-01.3gywuhh.mongodb.net:27017,ac-7ppebxj-shard-00-02.3gywuhh.mongodb.net:27017/?ssl=true&replicaSet=atlas-uu6dmi-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(uri, {
  family: 4 
})
.then(() => console.log('MongoDB 연결 성공!'))
.catch(err => console.log('연결 실패:', err));


// Todo 스키마 (데이터베이스에 들어갈 데이터 구조)
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date, default: null } 
}, { 
  timestamps: true 
});
const Todo = mongoose.model('Todo', todoSchema);


// API 엔드포인트 (CRUD 기능 모음)
app.get('/api/todos', async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

app.post('/api/todos', async (req, res) => {
  const newTodo = new Todo({ title: req.body.title });
  await newTodo.save();
  res.json(newTodo);
});

app.put('/api/todos/:id', async (req, res) => {
  const todo = await Todo.findByIdAndUpdate(req.params.id, { completed: req.body.completed }, { new: true });
  res.json(todo);
});

app.delete('/api/todos/:id', async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: '삭제 완료' });
});

const PORT = process.env.PORT || 5000;
// Vercel 환경이 아닐 때만(내 컴퓨터에서만) 서버 켜기
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
}

// Vercel이 이 앱을 서버리스 함수로 쓸 수 있게 내보내기
module.exports = app;