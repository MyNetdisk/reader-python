<template>
  <div id="app">
    <nav class="navbar">
      <router-link to="/" class="brand">📚 Reader</router-link>
      <div class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/books">书库</router-link>
      </div>
    </nav>
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  color: #333;
}

.navbar {
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 56px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.brand {
  font-size: 20px;
  font-weight: 700;
  text-decoration: none;
  color: #1a1a1a;
  margin-right: 32px;
}

.nav-links a {
  margin-right: 16px;
  text-decoration: none;
  color: #666;
  font-size: 14px;
}

.nav-links a.router-link-active {
  color: #409eff;
  font-weight: 600;
}

.container {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 24px;
}
</style>