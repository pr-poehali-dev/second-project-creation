import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type GameState = 'story' | 'playing' | 'throne' | 'win' | 'lose';

interface GameObject {
  x: number;
  y: number;
  active: boolean;
}

export default function Index() {
  const [gameState, setGameState] = useState<GameState>('story');
  const [playerX, setPlayerX] = useState(50);
  const [playerY, setPlayerY] = useState(50);
  const [isMoving, setIsMoving] = useState({ up: false, down: false, left: false, right: false });
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [inventory, setInventory] = useState(0);
  const [notes, setNotes] = useState<GameObject[]>([]);
  const [enemies, setEnemies] = useState<GameObject[]>([]);
  const gameLoopRef = useRef<number>();
  const moveIntervalRef = useRef<number>();

  useEffect(() => {
    if (gameState === 'playing') {
      setNotes([
        { x: 20, y: 15, active: true },
        { x: 80, y: 25, active: true },
        { x: 25, y: 40, active: true },
        { x: 75, y: 50, active: true },
        { x: 30, y: 65, active: true },
        { x: 70, y: 75, active: true },
        { x: 20, y: 85, active: true },
      ]);
      setEnemies([
        { x: 50, y: 20, active: true },
        { x: 40, y: 45, active: true },
        { x: 60, y: 70, active: true },
      ]);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      setNotes(prev => prev.map(note => {
        if (note.active && Math.abs(note.x - playerX) < 10 && Math.abs(note.y - playerY) < 10) {
          setInventory(inv => inv + 1);
          return { ...note, active: false };
        }
        return note;
      }));

      setEnemies(prev => prev.map(enemy => {
        if (enemy.active && Math.abs(enemy.x - playerX) < 10 && Math.abs(enemy.y - playerY) < 10) {
          setLives(l => l - 1);
          return { ...enemy, active: false };
        }
        return enemy;
      }));

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, playerX, playerY]);

  useEffect(() => {
    if (lives <= 0) setGameState('lose');
    if (score >= 15) setGameState('win');
  }, [lives, score]);

  useEffect(() => {
    const handleMovement = () => {
      setPlayerX(prev => {
        let newX = prev;
        if (isMoving.left) newX = Math.max(5, prev - 2);
        if (isMoving.right) newX = Math.min(95, prev + 2);
        return newX;
      });
      setPlayerY(prev => {
        let newY = prev;
        if (isMoving.up) newY = Math.max(5, prev - 2);
        if (isMoving.down) newY = Math.min(95, prev + 2);
        return newY;
      });
    };

    if (Object.values(isMoving).some(v => v)) {
      moveIntervalRef.current = window.setInterval(handleMovement, 30);
    } else {
      if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
    }

    return () => {
      if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
    };
  }, [isMoving]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') setIsMoving(prev => ({ ...prev, up: true }));
      if (key === 's' || key === 'arrowdown') setIsMoving(prev => ({ ...prev, down: true }));
      if (key === 'a' || key === 'arrowleft') setIsMoving(prev => ({ ...prev, left: true }));
      if (key === 'd' || key === 'arrowright') setIsMoving(prev => ({ ...prev, right: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') setIsMoving(prev => ({ ...prev, up: false }));
      if (key === 's' || key === 'arrowdown') setIsMoving(prev => ({ ...prev, down: false }));
      if (key === 'a' || key === 'arrowleft') setIsMoving(prev => ({ ...prev, left: false }));
      if (key === 'd' || key === 'arrowright') setIsMoving(prev => ({ ...prev, right: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setInventory(0);
    setPlayerX(50);
    setPlayerY(50);
    setIsMoving({ up: false, down: false, left: false, right: false });
  };

  const handleButtonPress = (direction: 'up' | 'down' | 'left' | 'right', pressed: boolean) => {
    setIsMoving(prev => ({ ...prev, [direction]: pressed }));
  };

  const goToThrone = () => {
    if (inventory > 0) {
      setGameState('throne');
    }
  };

  const deliverNotes = () => {
    setScore(s => s + inventory);
    setInventory(0);
    setGameState('playing');
  };

  if (gameState === 'story') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-purple-800 flex items-center justify-center p-4 pixel-art">
        <Card className="max-w-2xl p-8 bg-gray-900/90 border-4 border-purple-500 shadow-2xl">
          <div className="space-y-6 text-center">
            <div className="flex justify-center gap-4 mb-4">
              <img 
                src="https://cdn.poehali.dev/files/7bd725ee-a449-4fe6-95c1-698ddbcdc587.png"
                alt="Banoffee Cookie"
                className="w-24 h-24 object-contain pixel-art animate-fade-in"
              />
              <div className="text-6xl flex items-center">🏰</div>
              <img 
                src="https://cdn.poehali.dev/files/a0940257-0d1c-4196-97eb-74b931582916.jpg"
                alt="Affogato Cookie"
                className="w-24 h-24 object-contain pixel-art animate-fade-in"
                style={{ animationDelay: '0.3s' }}
              />
            </div>
            <h1 className="text-4xl font-bold text-purple-300 pixel-text">
              Любовь в Королевстве
            </h1>
            
            <div className="space-y-4 text-lg text-purple-200 text-left pixel-text leading-relaxed">
              <p className="animate-fade-in">
                🎮 Banoffee Cookie переехал в загадочное королевство в поисках новой жизни...
              </p>
              <p className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                💜 Там он встретил свою любовь - прекрасного Affogato Cookie!
              </p>
              <p className="animate-fade-in" style={{ animationDelay: '1s' }}>
                📝 Чтобы признаться в чувствах, нужно собрать 15 любовных записок в коридорах замка.
              </p>
              <p className="animate-fade-in text-orange-400" style={{ animationDelay: '1.5s' }}>
                ⚔️ Но злой Dark Cocoa Cookie будет мешать! Избегай его!
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <div className="text-purple-300 pixel-text">
                <p>🎯 Собери 15 записок 💌</p>
                <p>❤️ У тебя 3 жизни</p>
                <p>🕹️ Управляй колёсиком внизу</p>
              </div>
              
              <Button 
                onClick={startGame}
                className="w-full text-2xl py-8 pixel-text bg-purple-600 hover:bg-purple-700 border-4 border-purple-400 hover:scale-105 transition-transform"
              >
                Начать приключение! 🚀
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'win') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-600 via-purple-600 to-pink-700 flex items-center justify-center p-4">
        <Card className="max-w-xl p-8 bg-gray-900/90 border-4 border-pink-400 text-center">
          <div className="mb-6">
            <img 
              src="https://cdn.poehali.dev/files/a0940257-0d1c-4196-97eb-74b931582916.jpg" 
              alt="Affogato Cookie"
              className="w-48 h-48 mx-auto object-contain pixel-art animate-scale-in"
            />
          </div>
          <div className="text-7xl mb-4 animate-fade-in">💝</div>
          <h2 className="text-4xl font-bold text-pink-300 mb-4 pixel-text animate-fade-in">Победа!</h2>
          <p className="text-xl text-pink-200 mb-2 pixel-text animate-fade-in">
            Ты собрал все записки!
          </p>
          <p className="text-lg text-pink-300 mb-6 pixel-text animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Affogato Cookie принял твои чувства! 💕
          </p>
          <Button onClick={startGame} className="pixel-text bg-pink-600 hover:bg-pink-700 border-4 border-pink-400 hover:scale-105 transition-transform">
            Играть снова
          </Button>
        </Card>
      </div>
    );
  }

  if (gameState === 'throne') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="max-w-2xl p-8 bg-gradient-to-b from-purple-950 to-indigo-950 border-4 border-yellow-400 shadow-2xl">
          <div className="space-y-6 text-center">
            <p className="text-yellow-400 text-2xl pixel-text mb-4">👑 ТРОННЫЙ ЗАЛ 👑</p>
            
            <div className="relative inline-block animate-scale-in">
              <img 
                src="https://cdn.poehali.dev/files/a0940257-0d1c-4196-97eb-74b931582916.jpg" 
                alt="Affogato Cookie"
                className="w-64 h-64 object-contain pixel-art border-4 border-pink-400 rounded-xl bg-purple-900/80 shadow-2xl mx-auto"
              />
              <div className="absolute -top-3 -right-3 w-16 h-16 bg-pink-500 rounded-full border-4 border-white flex items-center justify-center text-2xl font-bold pixel-text shadow-xl">
                {score}
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-pink-300 pixel-text">Affogato Cookie</h2>
            
            <p className="text-xl text-purple-200 pixel-text">
              У тебя {inventory} {inventory === 1 ? 'записка' : 'записок'} 💌
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={deliverNotes}
                className="w-full text-xl py-6 pixel-text bg-pink-600 hover:bg-pink-700 border-4 border-pink-400 hover:scale-105 transition-transform"
              >
                💝 Отдать записки Affogato Cookie
              </Button>
              
              <Button 
                onClick={() => setGameState('playing')}
                className="w-full pixel-text bg-purple-600 hover:bg-purple-700 border-4 border-purple-400"
              >
                ← Вернуться в коридор
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'lose') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-800 via-gray-900 to-black flex items-center justify-center p-4">
        <Card className="max-w-xl p-8 bg-gray-900/90 border-4 border-red-600 text-center">
          <div className="text-7xl mb-4">💔</div>
          <h2 className="text-4xl font-bold text-red-400 mb-4 pixel-text">Поражение</h2>
          <p className="text-xl text-gray-300 mb-6 pixel-text">
            Dark Cocoa помешал тебе! Записок собрано: {score}/15
          </p>
          <Button onClick={startGame} className="pixel-text bg-red-600 hover:bg-red-700 border-4 border-red-500">
            Попробовать снова
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="bg-purple-950 border-b-4 border-purple-700 p-3 flex justify-between items-center pixel-text">
        <div className="flex gap-4 text-purple-200 text-sm md:text-lg">
          <span>💌 Отдано: {score}/15</span>
          <span>📦 В руках: {inventory}</span>
          <span>❤️ Жизни: {'❤️'.repeat(lives)}</span>
        </div>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-b from-purple-950 to-black" style={{ height: '55vh' }}>
        <div className="absolute inset-0 castle-corridor-pixel">
          <div className="corridor-windows"></div>
          
          {notes.map((note, i) => note.active && (
            <div
              key={`note-${i}`}
              className="absolute"
              style={{ left: `${note.x}%`, top: `${note.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="table-pixel">
                <div className="text-3xl pixel-sprite animate-pulse" style={{ marginTop: '-20px' }}>💌</div>
              </div>
            </div>
          ))}
          
          {enemies.map((enemy, i) => enemy.active && (
            <div
              key={`enemy-${i}`}
              className="absolute transition-all duration-300"
              style={{ left: `${enemy.x}%`, top: `${enemy.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <img 
                src="https://cdn.poehali.dev/files/5544d635-bbb8-4951-a899-90827bda4656.jpg"
                alt="Dark Cocoa Cookie"
                className="w-16 h-16 object-contain pixel-art animate-pulse"
                style={{ filter: 'drop-shadow(0 0 10px rgba(139, 0, 0, 0.8))' }}
              />
            </div>
          ))}

          <div
            className="absolute transition-all duration-100"
            style={{ left: `${playerX}%`, top: `${playerY}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className="relative">
              <img 
                src="https://cdn.poehali.dev/files/7bd725ee-a449-4fe6-95c1-698ddbcdc587.png"
                alt="Banoffee Cookie"
                className="w-20 h-20 object-contain pixel-art"
                style={{ filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))' }}
              />
              {inventory > 0 && (
                <span className="absolute -top-2 -right-2 text-3xl animate-bounce">💌</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border-t-4 border-purple-700 p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex gap-3 justify-center items-center">
            <Button 
              onClick={goToThrone}
              disabled={inventory === 0}
              className={`pixel-text text-base md:text-lg px-6 md:px-8 py-3 md:py-4 border-4 ${
                inventory > 0 
                  ? 'bg-yellow-600 hover:bg-yellow-700 border-yellow-400 animate-pulse' 
                  : 'bg-gray-600 border-gray-500 cursor-not-allowed opacity-50'
              }`}
            >
              👑 В тронный зал ({inventory} 💌)
            </Button>
          </div>
          
          <p className="text-center text-purple-300 pixel-text text-sm">
            🎮 Управление: WASD или стрелки клавиатуры
          </p>

          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            <div></div>
            <Button 
              onMouseDown={() => handleButtonPress('up', true)}
              onMouseUp={() => handleButtonPress('up', false)}
              onMouseLeave={() => handleButtonPress('up', false)}
              onTouchStart={() => handleButtonPress('up', true)}
              onTouchEnd={() => handleButtonPress('up', false)}
              className="pixel-text bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 border-4 border-indigo-400 text-2xl h-14 md:h-16"
            >
              ⬆️
            </Button>
            <div></div>
            
            <Button 
              onMouseDown={() => handleButtonPress('left', true)}
              onMouseUp={() => handleButtonPress('left', false)}
              onMouseLeave={() => handleButtonPress('left', false)}
              onTouchStart={() => handleButtonPress('left', true)}
              onTouchEnd={() => handleButtonPress('left', false)}
              className="pixel-text bg-purple-600 hover:bg-purple-700 active:bg-purple-800 border-4 border-purple-400 text-2xl h-14 md:h-16"
            >
              ⬅️
            </Button>
            <Button 
              onMouseDown={() => handleButtonPress('down', true)}
              onMouseUp={() => handleButtonPress('down', false)}
              onMouseLeave={() => handleButtonPress('down', false)}
              onTouchStart={() => handleButtonPress('down', true)}
              onTouchEnd={() => handleButtonPress('down', false)}
              className="pixel-text bg-purple-600 hover:bg-purple-700 active:bg-purple-800 border-4 border-purple-400 text-2xl h-14 md:h-16"
            >
              ⬇️
            </Button>
            <Button 
              onMouseDown={() => handleButtonPress('right', true)}
              onMouseUp={() => handleButtonPress('right', false)}
              onMouseLeave={() => handleButtonPress('right', false)}
              onTouchStart={() => handleButtonPress('right', true)}
              onTouchEnd={() => handleButtonPress('right', false)}
              className="pixel-text bg-purple-600 hover:bg-purple-700 active:bg-purple-800 border-4 border-purple-400 text-2xl h-14 md:h-16"
            >
              ➡️
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}