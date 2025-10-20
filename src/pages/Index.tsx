import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type GameState = 'story' | 'playing' | 'win' | 'lose';

interface GameObject {
  x: number;
  y: number;
  active: boolean;
}

export default function Index() {
  const [gameState, setGameState] = useState<GameState>('story');
  const [playerX, setPlayerX] = useState(50);
  const [playerY, setPlayerY] = useState(85);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [inventory, setInventory] = useState(0);
  const [notes, setNotes] = useState<GameObject[]>([]);
  const [enemies, setEnemies] = useState<GameObject[]>([]);
  const gameLoopRef = useRef<number>();
  const affogatoY = 10;

  useEffect(() => {
    if (gameState === 'playing') {
      setNotes([
        { x: Math.random() * 80 + 10, y: 0, active: true },
        { x: Math.random() * 80 + 10, y: -30, active: true },
        { x: Math.random() * 80 + 10, y: -60, active: true },
      ]);
      setEnemies([
        { x: Math.random() * 80 + 10, y: -20, active: true },
        { x: Math.random() * 80 + 10, y: -50, active: true },
      ]);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      setNotes(prev => prev.map(note => ({
        ...note,
        y: note.active ? note.y + 0.5 : note.y
      })).map(note => {
        if (note.active && note.y > playerY - 5 && note.y < playerY + 5 && Math.abs(note.x - playerX) < 8) {
          setInventory(inv => inv + 1);
          return { ...note, active: false, y: -Math.random() * 30 - 10, x: Math.random() * 80 + 10 };
        }
        if (note.y > 100) {
          return { ...note, y: -Math.random() * 20, x: Math.random() * 80 + 10, active: true };
        }
        return note;
      }));

      setEnemies(prev => prev.map(enemy => ({
        ...enemy,
        y: enemy.active ? enemy.y + 0.7 : enemy.y
      })).map(enemy => {
        if (enemy.active && enemy.y > playerY - 5 && enemy.y < playerY + 5 && Math.abs(enemy.x - playerX) < 8) {
          setLives(l => l - 1);
          return { ...enemy, active: false, y: -Math.random() * 30 - 10, x: Math.random() * 80 + 10 };
        }
        if (enemy.y > 100) {
          return { ...enemy, y: -Math.random() * 20, x: Math.random() * 80 + 10, active: true };
        }
        return enemy;
      }));

      if (inventory > 0 && Math.abs(playerX - 50) < 10 && playerY < 15) {
        setScore(s => s + inventory);
        setInventory(0);
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, playerX, playerY, inventory]);

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
    setPlayerY(85);
  };

  const handleUpButton = () => {
    setPlayerY(prev => Math.max(10, prev - 40));
  };

  const handleDownButton = () => {
    setPlayerY(prev => Math.min(85, prev + 40));
  };

  if (gameState === 'story') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-purple-800 flex items-center justify-center p-4 pixel-art">
        <Card className="max-w-2xl p-8 bg-gray-900/90 border-4 border-purple-500 shadow-2xl">
          <div className="space-y-6 text-center">
            <div className="text-6xl mb-4">🏰</div>
            <h1 className="text-4xl font-bold text-purple-300 pixel-text">
              Любовь в Королевстве
            </h1>
            
            <div className="space-y-4 text-lg text-purple-200 text-left pixel-text leading-relaxed">
              <p className="animate-fade-in">
                🎮 Главный герой переехал в загадочное королевство в поисках новой жизни...
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

      <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-indigo-950 to-purple-950">
        <div className="absolute inset-0 castle-corridor">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-center z-10">
            <div className="bg-gradient-to-b from-purple-800 to-purple-900 p-4 rounded-xl border-4 border-yellow-500 shadow-2xl">
              <p className="text-yellow-400 text-xs pixel-text mb-2">👑 ТРОННЫЙ ЗАЛ 👑</p>
              <div className="relative inline-block">
                <img 
                  src="https://cdn.poehali.dev/files/a0940257-0d1c-4196-97eb-74b931582916.jpg" 
                  alt="Affogato Cookie"
                  className="w-32 h-32 object-contain pixel-art border-4 border-pink-400 rounded-lg bg-purple-950/80 shadow-xl"
                />
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-pink-500 rounded-full border-2 border-white flex items-center justify-center text-lg font-bold pixel-text shadow-lg">
                  {score}
                </div>
              </div>
              <p className="text-pink-300 text-sm pixel-text mt-2">
                Affogato Cookie
              </p>
              {inventory > 0 && Math.abs(playerX - 50) < 10 && playerY < 15 && (
                <p className="text-green-400 text-xs pixel-text mt-1 animate-pulse">
                  ✨ Отдаю записки! ✨
                </p>
              )}
            </div>
          </div>

          {notes.map((note, i) => note.active && (
            <div
              key={`note-${i}`}
              className="absolute text-4xl transition-all duration-100 pixel-sprite"
              style={{ left: `${note.x}%`, top: `${note.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              💌
            </div>
          ))}
          
          {enemies.map((enemy, i) => enemy.active && (
            <div
              key={`enemy-${i}`}
              className="absolute text-4xl transition-all duration-100 pixel-sprite"
              style={{ left: `${enemy.x}%`, top: `${enemy.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              🍫
            </div>
          ))}

          <div
            className="absolute text-5xl transition-all duration-300 pixel-sprite"
            style={{ left: `${playerX}%`, top: `${playerY}%`, transform: 'translate(-50%, -50%)' }}
          >
            🏃
            {inventory > 0 && (
              <span className="absolute -top-3 -right-3 text-2xl">💌</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 border-t-4 border-purple-700 p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={handleUpButton}
              className="pixel-text bg-indigo-600 hover:bg-indigo-700 border-4 border-indigo-400 text-2xl px-8 py-6"
            >
              ⬆️ Вверх к трону
            </Button>
            <Button 
              onClick={handleDownButton}
              className="pixel-text bg-purple-600 hover:bg-purple-700 border-4 border-purple-400 text-2xl px-8 py-6"
            >
              ⬇️ Вниз за записками
            </Button>
          </div>
          
          <p className="text-center text-purple-300 mb-2 pixel-text text-xs">
            🕹️ Влево-вправо: двигай пальцем по колёсику
          </p>
          <div
            className="w-full h-20 bg-gradient-to-r from-purple-900 via-purple-700 to-purple-900 rounded-full border-4 border-purple-500 cursor-pointer relative shadow-lg pixel-border"
            onMouseMove={handleWheelMove}
            onTouchMove={handleTouchMove}
          >
            <div
              className="absolute top-1/2 w-14 h-14 bg-orange-500 rounded-full border-4 border-orange-300 shadow-xl transition-all pixel-sprite"
              style={{ 
                left: `${playerX}%`, 
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-xl">
                🎯
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}