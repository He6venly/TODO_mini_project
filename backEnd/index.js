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
  dueDate: { type: Date, default: null },
  // '등록 시간'과 '수정 시간'을 위한 명시적 공간을 만듭니다.
  createdAt: { type: Date, default: Date.now },
  editedAt: { type: Date, default: null } 
});
const Todo = mongoose.model('Todo', todoSchema);


// API 엔드포인트 (CRUD 기능 모음)
app.get('/api/todos', async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

app.post('/api/todos', async (req, res) => {
  try {
    const newTodo = new Todo({
      title: req.body.title,
      dueDate: req.body.dueDate
    });
    const savedTodo = await newTodo.save();
    res.json(savedTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        completed: req.body.completed,
        editedAt: req.body.editedAt 
      },
      { new: true } // 업데이트가 끝난 최신 데이터를 프론트엔드로 돌려줍니다.
    );
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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