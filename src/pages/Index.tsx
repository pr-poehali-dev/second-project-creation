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
  const [scrollY, setScrollY] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [inventory, setInventory] = useState(0);
  const [notes, setNotes] = useState<GameObject[]>([]);
  const [enemies, setEnemies] = useState<GameObject[]>([]);
  const gameLoopRef = useRef<number>();
  const playerY = 70;

  useEffect(() => {
    if (gameState === 'playing') {
      const tablePositions = [20, 35, 50, 65, 80];
      setNotes(
        tablePositions.map((y, i) => ({
          x: i % 2 === 0 ? 25 : 75,
          y: y,
          active: true
        }))
      );
      setEnemies([
        { x: 50, y: 10, active: true },
        { x: 30, y: 40, active: true },
        { x: 70, y: 60, active: true },
      ]);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      setNotes(prev => prev.map(note => {
        const adjustedY = note.y - scrollY;
        if (note.active && adjustedY > 65 && adjustedY < 75 && Math.abs(note.x - playerX) < 12) {
          setInventory(inv => inv + 1);
          return { ...note, active: false };
        }
        return note;
      }));

      setEnemies(prev => prev.map(enemy => {
        const adjustedY = enemy.y - scrollY;
        if (enemy.active && adjustedY > 65 && adjustedY < 75 && Math.abs(enemy.x - playerX) < 12) {
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
  }, [gameState, playerX, scrollY]);

  useEffect(() => {
    if (lives <= 0) setGameState('lose');
    if (score >= 15) setGameState('win');
  }, [lives, score]);

  const handleWheelMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setPlayerX(Math.max(10, Math.min(90, x)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    setPlayerX(Math.max(10, Math.min(90, x)));
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setInventory(0);
    setPlayerX(50);
    setScrollY(0);
  };

  const handleScrollUp = () => {
    setScrollY(prev => Math.min(prev + 2, 100));
  };

  const handleScrollDown = () => {
    setScrollY(prev => Math.max(prev - 2, 0));
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
      <div className="bg-purple-950 border-b-4 border-purple-700 p-4 flex justify-between items-center pixel-text">
        <div className="flex gap-6 text-purple-200 text-lg">
          <span>💌 Отдано: {score}/15</span>
          <span>📦 В руках: {inventory}</span>
          <span>❤️ Жизни: {'❤️'.repeat(lives)}</span>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-purple-950 to-black">
        <div className="absolute inset-0 castle-corridor-pixel">
          <div className="corridor-windows"></div>
          
          {notes.map((note, i) => {
            const adjustedY = note.y - scrollY;
            return note.active && adjustedY > -10 && adjustedY < 110 && (
              <div
                key={`note-${i}`}
                className="absolute"
                style={{ left: `${note.x}%`, top: `${adjustedY}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className="table-pixel">
                  <div className="text-3xl pixel-sprite animate-pulse" style={{ marginTop: '-20px' }}>💌</div>
                </div>
              </div>
            );
          })}
          
          {enemies.map((enemy, i) => {
            const adjustedY = enemy.y - scrollY;
            return enemy.active && adjustedY > -10 && adjustedY < 110 && (
              <div
                key={`enemy-${i}`}
                className="absolute transition-all duration-300"
                style={{ left: `${enemy.x}%`, top: `${adjustedY}%`, transform: 'translate(-50%, -50%)' }}
              >
                <img 
                  src="https://cdn.poehali.dev/files/5544d635-bbb8-4951-a899-90827bda4656.jpg"
                  alt="Dark Cocoa Cookie"
                  className="w-16 h-16 object-contain pixel-art animate-pulse"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(139, 0, 0, 0.8))' }}
                />
              </div>
            );
          })}

          <div
            className="absolute transition-all duration-200"
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
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex gap-3 justify-center items-center">
            <Button 
              onClick={goToThrone}
              disabled={inventory === 0}
              className={`pixel-text text-lg px-8 py-4 border-4 ${
                inventory > 0 
                  ? 'bg-yellow-600 hover:bg-yellow-700 border-yellow-400 animate-pulse' 
                  : 'bg-gray-600 border-gray-500 cursor-not-allowed opacity-50'
              }`}
            >
              👑 В тронный зал ({inventory} 💌)
            </Button>
          </div>
          
          <div className="flex gap-3 justify-center items-center">
            <Button 
              onMouseDown={handleScrollUp}
              onTouchStart={handleScrollUp}
              className="pixel-text bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 border-4 border-indigo-400 text-2xl px-8 py-4"
            >
              ⬆️ Вперёд
            </Button>
            <Button 
              onMouseDown={handleScrollDown}
              onTouchStart={handleScrollDown}
              className="pixel-text bg-purple-600 hover:bg-purple-700 active:bg-purple-800 border-4 border-purple-400 text-2xl px-8 py-4"
            >
              ⬇️ Назад
            </Button>
          </div>

          <p className="text-center text-purple-300 pixel-text text-sm mb-2">
            🕹️ Управление колёсиком влево-вправо
          </p>
          <div
            className="w-full h-24 bg-gradient-to-r from-purple-900 via-purple-700 to-purple-900 rounded-full border-4 border-purple-500 cursor-pointer relative shadow-lg pixel-border"
            onMouseMove={handleWheelMove}
            onTouchMove={handleTouchMove}
          >
            <div
              className="absolute top-1/2 w-16 h-16 bg-orange-500 rounded-full border-4 border-orange-300 shadow-xl transition-all pixel-sprite"
              style={{ 
                left: `${playerX}%`, 
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-2xl">
                🎯
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}