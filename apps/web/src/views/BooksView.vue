<template>
  <div class="books">
    <div class="header">
      <h2>书库</h2>
      <button class="btn" @click="showForm = !showForm">
        {{ showForm ? '取消' : '+ 添加书籍' }}
      </button>
    </div>

    <div v-if="showForm" class="form">
      <input v-model="form.title" placeholder="书名" />
      <input v-model="form.author" placeholder="作者" />
      <textarea v-model="form.description" placeholder="简介（可选）"></textarea>
      <button class="btn" @click="handleCreate" :disabled="!form.title || !form.author">
        提交
      </button>
    </div>

    <div v-if="loading" class="status">加载中...</div>
    <div v-else-if="books.length === 0" class="status">暂无书籍</div>
    <div v-else class="grid">
      <div v-for="book in books" :key="book.id" class="card">
        <h3>{{ book.title }}</h3>
        <p class="author">{{ book.author }}</p>
        <p v-if="book.description" class="desc">{{ book.description }}</p>
        <button class="btn-danger" @click="handleDelete(book.id)">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { getBooks, createBook, deleteBook, type Book } from '@/api/books'

const books = ref<Book[]>([])
const loading = ref(true)
const showForm = ref(false)

const form = reactive({
  title: '',
  author: '',
  description: '',
})

async function fetchBooks() {
  loading.value = true
  try {
    books.value = await getBooks()
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  await createBook({
    title: form.title,
    author: form.author,
    description: form.description || undefined,
  })
  form.title = ''
  form.author = ''
  form.description = ''
  showForm.value = false
  await fetchBooks()
}

async function handleDelete(id: number) {
  await deleteBook(id)
  await fetchBooks()
}

onMounted(fetchBooks)
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form input,
.form textarea {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form textarea {
  min-height: 60px;
  resize: vertical;
}

.btn {
  padding: 8px 16px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn:hover {
  background: #66b1ff;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  padding: 4px 12px;
  background: #f56c6c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 8px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.card h3 {
  margin-bottom: 4px;
}

.author {
  color: #999;
  font-size: 13px;
  margin-bottom: 8px;
}

.desc {
  color: #666;
  font-size: 13px;
  line-height: 1.5;
}

.status {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>