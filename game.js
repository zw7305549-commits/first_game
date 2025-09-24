// 取得 Canvas 與音效元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const shootSound = document.getElementById('shootSound');
const hitSound = document.getElementById('hitSound');
const gameOverSound = document.getElementById('gameOverSound');
const restartBtn = document.getElementById('restartBtn');

// 玩家物件
const player = { x:50, y:canvas.height/2-25, width:50, height:50, speed:5, hp:10 };

// 障礙物與子彈陣列
let obstacles = [];
let bullets = [];

// 遊戲分數、狀態、時間
let score = 0;
let gameOver = false;
let gameTime = 0;

// 技能冷卻
let lastSkillTime = 0;
const skillCooldown = 5000; // 5秒

// 紀錄按鍵狀態
const keys = {};
document.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;

  // 空白鍵射擊
  if(e.key === ' ' && !gameOver){
    bullets.push({ x:player.x+player.width, y:player.y+player.height/2-5, width:10, height:10, speed:8 });
    shootSound.currentTime = 0; shootSound.play();
  }

  // Shift 全屏技能（冷卻）
  if(e.key === 'Shift' && !gameOver){
    const now = Date.now();
    if(now - lastSkillTime >= skillCooldown){
      score += obstacles.length*50; // 全部障礙加分
      obstacles = [];               // 清空障礙
      lastSkillTime = now;
      console.log('全屏攻擊啟動！');
    }
  }
});
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// 隨機生成障礙物
function spawnObstacle() {
  const height = Math.random()*100+30; // 障礙高度
  const y = Math.random()*(canvas.height-height); // 隨機 Y 位置
  const speed = 3 + Math.random()*2 + gameTime/500; // 隨時間加快
  obstacles.push({ x:canvas.width, y:y, width:30, height:height, speed:speed });
}

// 碰撞檢查函式
function isCollide(a,b){
  return a.x < b.x+b.width && a.x+a.width > b.x &&
         a.y < b.y+b.height && a.y+a.height > b.y;
}

// 遊戲重新開始
function restartGame() {
  player.x = 50; player.y = canvas.height/2-25; player.hp = 10;
  obstacles = []; bullets = []; score = 0; gameTime = 0; gameOver = false; lastSkillTime = 0;
  restartBtn.style.display = 'none';
  update();
}
restartBtn.addEventListener('click', restartGame);

// 更新遊戲狀態
function update() {
  if(gameOver) return;
  gameTime += 1;

  // 玩家移動（WASD）
  if(keys['w'] && player.y>0) player.y -= player.speed;
  if(keys['s'] && player.y+player.height<canvas.height) player.y += player.speed;
  if(keys['a'] && player.x>0) player.x -= player.speed;
  if(keys['d'] && player.x+player.width<canvas.width) player.x += player.speed;
  // 玩家移動(方向鍵)
  if(keys['arrowup'] && player.y>0) player.y -= player.speed;
  if(keys['arrowdown'] && player.y+player.height<canvas.height) player.y += player.speed;
  if(keys['arrowleft'] && player.x>0) player.x -= player.speed;
  if(keys['arrowright'] && player.x+player.width<canvas.width) player.x += player.speed;

  // 障礙物移動
  obstacles.forEach(ob => ob.x -= ob.speed);
  obstacles = obstacles.filter(ob => ob.x+ob.width>0);

  // 子彈移動
  bullets.forEach(b => b.x += b.speed);
  bullets = bullets.filter(b => b.x < canvas.width);

  // 子彈擊中障礙
  bullets.forEach((b,i)=>{
    obstacles.forEach((ob,j)=>{
      if(isCollide(b,ob)){
        bullets.splice(i,1);
        obstacles.splice(j,1);
        score += 50;
        hitSound.currentTime=0; hitSound.play();
      }
    });
  });

  // 玩家碰到障礙
  obstacles.forEach((ob,i)=>{
    if(isCollide(player,ob)){
      obstacles.splice(i,1);
      player.hp -=1;
      hitSound.currentTime=0; hitSound.play();
      if(player.hp<=0){
        gameOver = true;
        gameOverSound.play();
        restartBtn.style.display = 'block'; // 顯示重新開始按鈕
      }
    }
  });

  // 隨機生成新障礙
  if(Math.random() < 0.02 + gameTime/20000) spawnObstacle();

  // 更新 UI
  document.getElementById('score').textContent = `分數：${score}`;
  document.getElementById('hp').textContent = `血量：${player.hp}`;

  draw();
  requestAnimationFrame(update);
}

// 繪圖函式
let bgOffset = 0;
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // 背景滾動
  bgOffset -= 1;
  ctx.fillStyle="#333";
  for(let i=0;i<canvas.width;i+=50){
    for(let j=0;j<canvas.height;j+=50){
      ctx.fillRect(i+bgOffset%50,j,48,48);
    }
  }

  // 玩家
  ctx.fillStyle='lime';
  ctx.fillRect(player.x,player.y,player.width,player.height);

  // 障礙物
  ctx.fillStyle='red';
  obstacles.forEach(ob=>ctx.fillRect(ob.x,ob.y,ob.width,ob.height));

  // 子彈
  ctx.fillStyle='yellow';
  bullets.forEach(b=>ctx.fillRect(b.x,b.y,b.width,b.height));

  // 遊戲結束顯示
  if(gameOver){
    ctx.fillStyle='white';
    ctx.font='48px sans-serif';
    ctx.fillText('遊戲結束', canvas.width/2-120, canvas.height/2);
  }
}

update();
