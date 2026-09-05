const { rm } = require('fs').promises;
const path = require('path');
const glob = require('glob'); // 如果项目里没有glob，可以用其他遍历目录的方法

async function clean() {
  const dirsToDelete = [
    'node_modules',
    'dist',
    '.turbo',
    '.next',
    '.cache'
  ];

  // 查找并删除根目录及所有子目录下的指定文件夹
  // 这里为了简单，直接列出需要清理的相对路径，实际项目中可以使用递归遍历
  const targets = [
    path.join(__dirname, '../node_modules'),
    path.join(__dirname, '../apps/*/node_modules'),
    path.join(__dirname, '../packages/*/node_modules'),
    path.join(__dirname, '../dist'),
  ];

  for (const target of targets) {
    try {
      // 实际项目中建议使用 rimraf 或类似库来兼容通配符
      console.log(`正在清理: ${target}`);
      await rm(target, { recursive: true, force: true });
    } catch (err) {
      // 忽略不存在的目录
    }
  }

  console.log('✅ 清理任务完成！');
}

clean();