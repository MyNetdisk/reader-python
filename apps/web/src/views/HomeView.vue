<template>
  <div class="home">
    <h1>📚 Reader</h1>
    <p class="subtitle">电子书阅读平台</p>
    <div class="actions">
      <router-link to="/books" class="btn">进入书库</router-link>
    </div>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
  padding: 80px 0;
}

.home h1 {
  font-size: 48px;
  margin-bottom: 12px;
}

.subtitle {
  font-size: 18px;
  color: #999;
  margin-bottom: 32px;
}

.btn {
  display: inline-block;
  padding: 10px 24px;
  background: #409eff;
  color: #fff;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
}

.btn:hover {
  background: #66b1ff;
}
</style>