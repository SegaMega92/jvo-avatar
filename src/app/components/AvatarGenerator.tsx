import { useEffect, useRef, useState } from "react";
import { Download, RefreshCw, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import svgPaths from "../../imports/svg-pdfdvkp3zc";

// Палитра цветов
const COLORS = [
  // Светлые
  "#FFFFFF", "#FF8FDA", "#C16FFB", "#FF965F", "#FACF61", "#B8EE49",
  // Темные
  "#15181F", "#3F0030", "#300247", "#381300", "#2A1E01", "#172104"
];

// Только светлые цвета для градиентов (без белого)
const LIGHT_COLORS = ["#FF8FDA", "#C16FFB", "#FF965F", "#FACF61", "#B8EE49"];

// Пары цветов: цвет фона -> цвет логотипа
const COLOR_PAIRS: { [key: string]: string } = {
  // Светлые -> Темные
  "#FFFFFF": "#15181F",
  "#FF8FDA": "#3F0030",
  "#C16FFB": "#300247",
  "#FF965F": "#381300",
  "#FACF61": "#2A1E01",
  "#B8EE49": "#172104",
  // Темные -> Светлые
  "#15181F": "#FFFFFF",
  "#3F0030": "#FF8FDA",
  "#300247": "#C16FFB",
  "#381300": "#FF965F",
  "#2A1E01": "#FACF61",
  "#172104": "#B8EE49"
};

type BackgroundType = "color" | "gradient" | "photo";
type SettingsTab = "color" | "gradient" | "emoji" | "photo";
type GradientType = "radial" | "linear" | "diamond";

// API ключ Pexels из переменной окружения
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || "";

interface GradientStop {
  color: string;
  position: number;
}

interface Gradient {
  stops: GradientStop[];
  centerX: number;
  centerY: number;
  radius: number;
  type: GradientType;
  angle: number; // Угол для линейного градиента
}

interface EffectParams {
  pixelationSize: number;
}

interface ActiveEffects {
  pixelation: boolean;
}

interface EmojiPattern {
  enabled: boolean;
  emoji: string;
  size: number;
  layout: "random" | "grid"; // Тип расположения
  dithering: boolean;        // Эффект dithering
  ditheringIntensity: number; // Интенсивность (1-5)
}

interface PhotoBackground {
  imageData: ImageData | null;  // Загруженное изображение
  segments: number;              // Количество сегментов калейдоскопа (4-12)
  zoom: number;                  // Масштаб (0.5 - 2.5)
  rotation: number;              // Поворот в градусах (0 - 360)
  pixelation: boolean;           // Включена ли пикселизация
  pixelationSize: number;        // Размер пикселя (6-96)
  loading: boolean;              // Индикатор загрузки
  photographer?: string;         // Автор для атрибуции
  averageColor?: string;         // Средний цвет для логотипа
}

// Предложенные эмодзи - расширенная библиотека
const PRESET_EMOJIS = [
  // Звезды и блеск
  "✨", "⭐", "💫", "🌟", "⚡", "🔥", "💥", "✴️", "🌠", "☄️",
  // Сердца и эмоции
  "❤️", "💜", "💙", "💚", "🧡", "💛", "🖤", "🤍", "🤎", "💖",
  "💗", "💓", "💞", "💕", "💝", "❣️", "💔", "❤️‍🔥", "❤️‍🩹", "💌",
  // Природа
  "🌸", "🌺", "🌻", "🌷", "🌹", "🥀", "🏵️", "💐", "🌼", "🌿",
  "☘️", "🍀", "🌱", "🌲", "🌳", "🌴", "🌵", "🌾", "🌊", "🌈",
  // Небо и погода
  "☀️", "🌤️", "⛅", "🌥️", "☁️", "🌦", "🌧️", "⛈️", "🌩️", "🌨️",
  "❄️", "☃️", "⛄", "🌬️", "💨", "🌪️", "🌫️", "🌙", "🌛", "🌜",
  "🌚", "🌝", "🌞", "🌍", "🌎", "🌏", "🌐", "🪐", "🌑", "🌒",
  // Животные
  "🦋", "🐝", "🐞", "🦗", "🕷️", "🦂", "🐢", "🐍", "🦎", "🦖",
  "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬",
  "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🐒",
  "🐶", "🐕", "🐩", "🐺", "🦊", "🦝", "🐱", "🐈", "🦁", "🐯",
  "🐴", "🦄", "🦌", "🐮", "🐷", "🐗", "🐽", "rams", "🐑", "🐭",
  // Еда и напитки
  "🍎", "🍏", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒",
  "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬",
  "🌶️", "🌽", "🥕", "🥒", "🥗", "🍕", "🍔", "🍟", "🌭", "🥪",
  "🌮", "🌯", "🥙", "🧆", "🥚", "🍳", "🧈", "🥞", "🧇", "🧀",
  "🍖", "🍗", "🥩", "🥓", "🥨", "🥯", "🍞", "🥖", "🥐", "",
  // Десерты и сладости
  "🍰", "🎂", "🧁", "🥧", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩",
  "🍪", "🌰", "🥜", "🍯", "🥛", "🍼", "☕", "🍵", "🧃", "🥤",
  "🍶", "🍺", "🍻", "🥂", "🍷", "🥃", "🍸", "🍹", "🧉", "🍾",
  // Активности и спорт
  "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱",
  "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🥅", "⛳", "🏹", "🎣",
  "🥊", "🥋", "🎽", "🛹", "🛼", "🛷", "⛸️", "🥌", "🎿", "⛷️",
  // Музыка и искусство
  "🎨", "🖌️", "🖍️", "🖊️", "🖋️", "✏️", "📝", "🎭", "🎪", "🎬",
  "🎤", "🎧", "🎼", "🎹", "🥁", ".sax", " труба", "гитара", "🪕", "🎻",
  "🎲", "♠️", "♥️", "♦️", "♣️", "🃏", "🀄", "🎴", "🎯", "🎳",
  // Объекты и символы
  "💎", "💍", "👑", "🔱", "📿", "💄", "💋", "👄", " зуб", "👅",
  "👂", "👃", "👣", "👁️", "👀", "🧠", "🦴", " зуб", "💀", "☠️",
  "🤖", "👾", "👽", "👻", "💩", "😺", "😸", "😹", "😻", "😼",
  "😽",
  // Знаки и символы
  "💯", "💢", "💬", "💭", "🗯️", "💤", "💮", "♨️", "🚨", "🔔",
  "🔕", "🎵", "🎶", "🔇", "🔈", "🔉", "🔊", "📢", "📣", "📯",
  "🔱", "⚜️", "🔰", "♻️", "✅", "☑️", "✔️", "✖️", "❌", "❎",
  "➕", "➖", "➗", "➰", "➿", "〽️", "✳️", "✴️", "❇️", "‼️",
  "⁉️", "❓", "❔", "❕", "❗", "〰️", "©️", "®️", "™️", "🔘"
];

export function AvatarGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const [backgroundType, setBackgroundType] = useState<BackgroundType>("color");
  const [selectedColor, setSelectedColor] = useState(COLORS[1]); // #ff8fda
  const [gradient, setGradient] = useState<Gradient>(() => generateRandomGradient());
  const [activeEffects, setActiveEffects] = useState<ActiveEffects>({
    pixelation: false
  });
  const [effectParams, setEffectParams] = useState<EffectParams>({
    pixelationSize: 24
  });
  const [logoVolume, setLogoVolume] = useState(0); // 0-10
  const [emojiPattern, setEmojiPattern] = useState<EmojiPattern>({
    enabled: false,
    emoji: "✨",
    size: 124,
    layout: "random",
    dithering: false,
    ditheringIntensity: 3
  });
  const [customEmoji, setCustomEmoji] = useState("");
  const [emojiSeed, setEmojiSeed] = useState(0); // Seed для рандомизации расположения эмодзи
  const [emojiPage, setEmojiPage] = useState(0); // Текущая страница эмодзи
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("color");
  const [isShaking, setIsShaking] = useState(false); // Состояние для анимации тряски
  const [isGenerating, setIsGenerating] = useState(false); // Состояние для эффекта генерации
  const [photoBackground, setPhotoBackground] = useState<PhotoBackground>({
    imageData: null,
    segments: 6,
    zoom: 1.0,
    rotation: 0,
    pixelation: false,
    pixelationSize: 24,
    loading: false
  });
  
  // Монтирование компонента
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Генерация случайного градиента на основе принципов из приложенных градиентов
  function generateRandomGradient(): Gradient {
    const numStops = 3; // Всегда 3 цвета
    const stops: GradientStop[] = [];
    
    // Выбираем случайные цвета из светлой палитры
    const selectedColors = [...LIGHT_COLORS]
      .sort(() => Math.random() - 0.5)
      .slice(0, numStops);
    
    for (let i = 0; i < numStops; i++) {
      stops.push({
        color: selectedColors[i],
        position: i / (numStops - 1)
      });
    }
    
    // Случайный тип градиента
    const types: GradientType[] = ["radial", "linear", "diamond"];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    return {
      stops,
      centerX: Math.random() * 0.6 + 0.2, // 0.2-0.8
      centerY: Math.random() * 0.6 + 0.2, // 0.2-0.8
      radius: Math.random() * 0.5 + 0.5, // 0.5-1.0
      type: randomType,
      angle: Math.random() * Math.PI * 2 // Угол для линейного градиента
    };
  }
  
  // Рассчитываем яркость цвета
  function getLuminance(hex: string): number {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  
  // Определяем цвет логотипа на основе фона
  function getLogoColor(backgroundColor: string): string {
    const luminance = getLuminance(backgroundColor);
    return luminance > 0.5 ? "#000000" : "#ffffff";
  }
  
  // Получаем средний цвет градиента
  function getAverageGradientColor(grad: Gradient): string {
    // Берм первый цвет для упрощения
    return grad.stops[0].color;
  }

  // Получаем средний цвет изображения
  function getAverageImageColor(imageData: ImageData): string {
    const data = imageData.data;
    let r = 0, g = 0, b = 0;
    const step = 100; // Сэмплируем каждый 100-й пиксель для скорости
    let count = 0;

    for (let i = 0; i < data.length; i += 4 * step) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // Загружаем фото и получаем ImageData
  async function loadPhotoToCanvas(imageUrl: string): Promise<{ imageData: ImageData; averageColor: string }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Создаём временный canvas для получения ImageData
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = 1080;
        tempCanvas.height = 1080;
        const tempCtx = tempCanvas.getContext("2d");

        if (tempCtx) {
          // Центрируем и масштабируем изображение
          const scale = Math.max(1080 / img.width, 1080 / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          const x = (1080 - w) / 2;
          const y = (1080 - h) / 2;
          tempCtx.drawImage(img, x, y, w, h);

          const imageData = tempCtx.getImageData(0, 0, 1080, 1080);
          const averageColor = getAverageImageColor(imageData);

          resolve({ imageData, averageColor });
        } else {
          reject(new Error("Не удалось получить контекст canvas"));
        }
      };
      img.onerror = () => reject(new Error("Не удалось загрузить изображение"));
      img.src = imageUrl;
    });
  }

  // Загружаем случайное фото с Pexels
  async function fetchRandomPhoto(): Promise<void> {
    if (!PEXELS_API_KEY) {
      console.error("API ключ Pexels не настроен. Добавьте VITE_PEXELS_API_KEY в .env файл");
      return;
    }

    setPhotoBackground(prev => ({ ...prev, loading: true }));

    try {
      const randomPage = Math.floor(Math.random() * 50) + 1;
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${["abstract", "pink", "violet"][Math.floor(Math.random() * 3)]}&per_page=15&page=${randomPage}&orientation=square`,
        { headers: { 'Authorization': PEXELS_API_KEY } }
      );

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`);
      }

      const data = await response.json();

      if (!data.photos || data.photos.length === 0) {
        throw new Error("Фотографии не найдены");
      }

      const photo = data.photos[Math.floor(Math.random() * data.photos.length)];

      // Загружаем изображение
      const { imageData, averageColor } = await loadPhotoToCanvas(photo.src.large);

      setPhotoBackground(prev => ({
        ...prev,
        imageData,
        averageColor,
        photographer: photo.photographer,
        loading: false
      }));
      setBackgroundType("photo");
    } catch (error) {
      console.error("Ошибка загрузки фото:", error);
      setPhotoBackground(prev => ({ ...prev, loading: false }));
    }
  }

  // Рисуем эффект калейдоскопа
  function drawKaleidoscope(ctx: CanvasRenderingContext2D, size: number) {
    if (!photoBackground.imageData) return;

    const segments = photoBackground.segments;
    const zoom = photoBackground.zoom;
    const rotation = (photoBackground.rotation * Math.PI) / 180; // в радианы
    const centerX = size / 2;
    const centerY = size / 2;
    const angleSlice = (Math.PI * 2) / segments;
    const maxDistance = Math.hypot(centerX, centerY);

    // Создаём временный canvas с исходным изображением
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;
    tempCtx.putImageData(photoBackground.imageData, 0, 0);

    // Очищаем основной canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, size, size);

    // Рисуем сегменты калейдоскопа
    for (let i = 0; i < segments; i++) {
      ctx.save();

      ctx.translate(centerX, centerY);
      ctx.rotate(i * angleSlice);

      // Треугольный клиппинг
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(maxDistance * Math.cos(-angleSlice / 2),
                 maxDistance * Math.sin(-angleSlice / 2));
      ctx.lineTo(maxDistance * Math.cos(angleSlice / 2),
                 maxDistance * Math.sin(angleSlice / 2));
      ctx.closePath();
      ctx.clip();

      // Зеркалим каждый нечётный сегмент
      if (i % 2 === 1) {
        ctx.scale(-1, 1);
      }

      // Применяем поворот к изображению
      ctx.rotate(rotation);

      // Рисуем изображение с учётом масштаба
      const scaledSize = size * zoom;
      ctx.drawImage(tempCanvas, -scaledSize / 2, -scaledSize / 2, scaledSize, scaledSize);

      ctx.restore();
    }
  }
  
  // Рисуем аватарку на canvas
  function drawAvatar() {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      
      const size = 1080;
      
      // Очищаем canvas
      ctx.clearRect(0, 0, size, size);
      
      // Рисуем фон
      if (backgroundType === "photo") {
        // Калейдоскоп из фото
        drawKaleidoscope(ctx, size);
      } else if (backgroundType === "color") {
        ctx.fillStyle = selectedColor;
        ctx.fillRect(0, 0, size, size);
      } else if (backgroundType === "gradient") {
        // Рисуем градиент в зависимости от типа
        if (gradient.type === "radial") {
          // Радиальный градиент
          const gradientObj = ctx.createRadialGradient(
            gradient.centerX * size,
            gradient.centerY * size,
            0,
            gradient.centerX * size,
            gradient.centerY * size,
            gradient.radius * size
          );
          
          gradient.stops.forEach(stop => {
            gradientObj.addColorStop(stop.position, stop.color);
          });
          
          ctx.fillStyle = gradientObj;
          ctx.fillRect(0, 0, size, size);
        } else if (gradient.type === "linear") {
          // Линейный градиент (под случайным углом)
          const angle = gradient.angle;
          const length = size * Math.sqrt(2);
          const x1 = size / 2 - Math.cos(angle) * length / 2;
          const y1 = size / 2 - Math.sin(angle) * length / 2;
          const x2 = size / 2 + Math.cos(angle) * length / 2;
          const y2 = size / 2 + Math.sin(angle) * length / 2;
          
          const gradientObj = ctx.createLinearGradient(x1, y1, x2, y2);
          
          gradient.stops.forEach(stop => {
            gradientObj.addColorStop(stop.position, stop.color);
          });
          
          ctx.fillStyle = gradientObj;
          ctx.fillRect(0, 0, size, size);
        } else if (gradient.type === "diamond") {
          // Ромбовидный градиент (через пиксели)
          const imageData = ctx.createImageData(size, size);
          const data = imageData.data;
          
          const cx = gradient.centerX * size;
          const cy = gradient.centerY * size;
          const maxDist = size * gradient.radius;
          
          for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
              // Манхэттенская дистанция для создания ромбовидной формы
              const dist = (Math.abs(x - cx) + Math.abs(y - cy)) / maxDist;
              const clampedDist = Math.min(1, dist);
              
              // Интерполяция цвета
              const color = interpolateGradientColor(gradient.stops, clampedDist);
              
              const idx = (y * size + x) * 4;
              data[idx] = color.r;
              data[idx + 1] = color.g;
              data[idx + 2] = color.b;
              data[idx + 3] = 255;
            }
          }
          
          ctx.putImageData(imageData, 0, 0);
        }
      }
      
      // Применяем эффект
      applyEffect(ctx, size);
      
      // Рисуем паттерн из эмодзи поверх фона с эффектами (но под логотипом)
      if (emojiPattern.enabled) {
        if (emojiPattern.dithering) {
          // Рисуем эмодзи на отдельном canvas, применяем dithering, потом накладываем
          const emojiCanvas = document.createElement("canvas");
          emojiCanvas.width = size;
          emojiCanvas.height = size;
          const emojiCtx = emojiCanvas.getContext("2d");
          if (emojiCtx) {
            // Рисуем эмодзи на прозрачном фоне
            drawEmojiPattern(emojiCtx, size);
            // Применяем dithering только к эмодзи
            applyDithering(emojiCtx, size, emojiPattern.ditheringIntensity);
            // Накладываем на основной canvas
            ctx.drawImage(emojiCanvas, 0, 0);
          }
        } else {
          drawEmojiPattern(ctx, size);
        }
      }
      
      // Рисуем логотип
      let logoColor: string;
      if (backgroundType === "color") {
        logoColor = COLOR_PAIRS[selectedColor.toUpperCase()] || getLogoColor(selectedColor);
      } else if (backgroundType === "gradient") {
        logoColor = COLOR_PAIRS[getAverageGradientColor(gradient).toUpperCase()] || getLogoColor(getAverageGradientColor(gradient));
      } else {
        // photo - используем средний цвет изображения
        logoColor = getLogoColor(photoBackground.averageColor || "#808080");
      }
      
      // Объём логотипа только для однотонного фона
      const effectiveLogoVolume = backgroundType === "color" ? logoVolume : 0;
      
      drawLogo(ctx, size, logoColor, effectiveLogoVolume);
    } catch (error) {
      console.error("Error drawing avatar:", error);
    }
  }
  
  // Рисуем логотип
  function drawLogo(ctx: CanvasRenderingContext2D, size: number, color: string, volume: number) {
    const scale = size / 120; // Исходный размер 120x120
    const logoSize = size * 0.845; // Логотип занимает 84.5% от размера (130% от предыдущего)
    const offset = (size - logoSize) / 2;
    
    ctx.save();
    ctx.translate(offset, offset);
    ctx.scale(logoSize / 120, logoSize / 120);
    
    // Если объёмность больше 0, добавляем тень для объёма
    if (volume > 0) {
      // Мультипликатор: volume * 10 (значение 1 = старое 10, значение 10 = старое 10 * 100)
      const volumeMultiplier = volume * 10;
      
      // Рисуем тень под логотипом
      ctx.save();
      ctx.shadowColor = `rgba(0, 0, 0, ${Math.min(1, 0.008 * volumeMultiplier)})`; // макс 1.0 (на 80% прозрачнее)
      ctx.shadowBlur = 0.8 * volumeMultiplier; // 8 при уровне 1, 80 при уровне 10
      ctx.shadowOffsetX = 0.3 * volumeMultiplier; // 3 при уровне 1, 30 при уровне 10
      ctx.shadowOffsetY = 0.3 * volumeMultiplier; // 3 при уровне 1, 30 при уровне 10
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, 0.004 * volumeMultiplier)})`; // макс 1.0 (на 80% прозрачне)
      
      const path1Shadow = new Path2D(svgPaths.p22ef19f0);
      ctx.fill(path1Shadow);
      const path2Shadow = new Path2D(svgPaths.p6813300);
      ctx.fill(path2Shadow);
      ctx.restore();
    }
    
    // Применяем сълошной цвет
    ctx.fillStyle = color;
    
    // Первый путь
    const path1 = new Path2D(svgPaths.p22ef19f0);
    ctx.fill(path1);
    
    // Второй путь
    const path2 = new Path2D(svgPaths.p6813300);
    ctx.fill(path2);
    
    // Добавляем блик для объёма (только если объёмность больше 0)
    if (volume > 0) {
      const volumeMultiplier = volume * 10;
      
      ctx.save();
      ctx.globalCompositeOperation = "overlay";
      
      // Создаём градиент бликов от верхнего левого угла
      const highlightGrad = ctx.createRadialGradient(30, 30, 0, 60, 60, 80);
      highlightGrad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, 0.06 * volumeMultiplier)})`); // макс 1.0
      highlightGrad.addColorStop(0.5, `rgba(255, 255, 255, ${Math.min(1, 0.02 * volumeMultiplier)})`); // макс 1.0
      highlightGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      
      ctx.fillStyle = highlightGrad;
      ctx.fill(path1);
      ctx.fill(path2);
      ctx.restore();
    }
    
    ctx.restore();
  }
  
  // Рисум паттерн из эмодзи
  function drawEmojiPattern(ctx: CanvasRenderingContext2D, size: number) {
    try {
      const emoji = customEmoji || emojiPattern.emoji;
      if (!emoji) return;
      
      const emojiSize = emojiPattern.size;
      
      // Настройка шрифта для эмодзи
      ctx.save();
      ctx.font = `${emojiSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // Эмодзи без эффектов: 100% непрозрачность, без дополнительной раскраски
      ctx.globalAlpha = 1.0;
      
      // Генерируем стабильные позиции для эмодзи
      const spacing = emojiSize * 1.5; // Расстояние между эмодзи зависит от размера
      const cols = Math.ceil(size / spacing) + 2; // Добавляем запас для центрирования
      const rows = Math.ceil(size / spacing) + 2; // Добавляем запас для центрирования
      
      // Смещение для центрирования паттерна
      const centerX = size / 2;
      const centerY = size / 2;
      const offsetX = centerX - ((cols - 1) * spacing) / 2;
      const offsetY = centerY - ((rows - 1) * spacing) / 2;
      
      // Простая функция для детерминированного "случайного" смещения
      const pseudoRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };
      
      // Рисуем эмодзи по всму canvas, включая область логотипа
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          let x: number, y: number;
          
          if (emojiPattern.layout === "grid") {
            // Ровная сетка - без смещений, но с центрированием
            x = col * spacing + offsetX;
            y = row * spacing + offsetY;
          } else {
            // Случайное расположение - со смещениями и центрированием
            const seed1 = row * 1000 + col + emojiSeed;
            const seed2 = row * 2000 + col * 3 + emojiSeed;
            
            const randomOffsetX = (pseudoRandom(seed1) - 0.5) * spacing * 0.5;
            const randomOffsetY = (pseudoRandom(seed2) - 0.5) * spacing * 0.5;
            
            x = col * spacing + offsetX + randomOffsetX;
            y = row * spacing + offsetY + randomOffsetY;
          }
          
          // Рисуем эмодзи везде, включая центр (за логотипом)
          // Проверяем, что эмодзи в пределах canvas (с небольшим запасом)
          if (x > -emojiSize && x < size + emojiSize && y > -emojiSize && y < size + emojiSize) {
            ctx.fillText(emoji, x, y);
          }
        }
      }
      
      ctx.restore();
    } catch (error) {
      console.error("Error drawing emoji pattern:", error);
    }
  }
  
  // Генерация материала для логотипа на основе текстового запроса
  function generateMaterialFill(
    ctx: CanvasRenderingContext2D, 
    materialName: string, 
    size: number,
    baseColor: string
  ): string | CanvasGradient | CanvasPattern {
    const name = materialName.toLowerCase();
    
    // Радуга / Rainbow
    if (name.includes("раду") || name.includes("rainbow")) {
      const grad = ctx.createLinearGradient(0, 0, size, 0);
      grad.addColorStop(0, "#ff0000");
      grad.addColorStop(0.16, "#ff7f00");
      grad.addColorStop(0.33, "#ffff00");
      grad.addColorStop(0.5, "#00ff00");
      grad.addColorStop(0.66, "#0000ff");
      grad.addColorStop(0.83, "#4b0082");
      grad.addColorStop(1, "#9400d3");
      return grad;
    }
    
    // Золото / Gold
    if (name.includes("золот") || name.includes("gold")) {
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, "#ffd700");
      grad.addColorStop(0.5, "#ffed4e");
      grad.addColorStop(1, "#d4af37");
      return grad;
    }
    
    // Серебро / Silver
    if (name.includes("серебр") || name.includes("silver")) {
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, "#c0c0c0");
      grad.addColorStop(0.5, "#e8e8e8");
      grad.addColorStop(1, "#a8a8a8");
      return grad;
    }
    
    // Медь / Copper
    if (name.includes("мед") || name.includes("copper")) {
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, "#b87333");
      grad.addColorStop(0.5, "#d4915d");
      grad.addColorStop(1, "#9c5a2d");
      return grad;
    }
    
    // Металл / Metal
    if (name.includes("металл") || name.includes("metal") || name.includes("chrome") || name.includes("хром")) {
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, "#505050");
      grad.addColorStop(0.3, "#d0d0d0");
      grad.addColorStop(0.5, "#ffffff");
      grad.addColorStop(0.7, "#d0d0d0");
      grad.addColorStop(1, "#505050");
      return grad;
    }
    
    // Огонь / Fire
    if (name.includes("огон") || name.includes("огня") || name.includes("fire") || name.includes("flame")) {
      const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size);
      grad.addColorStop(0, "#ffff00");
      grad.addColorStop(0.3, "#ff9900");
      grad.addColorStop(0.6, "#ff0000");
      grad.addColorStop(1, "#990000");
      return grad;
    }
    
    // Лёд / Ice
    if (name.includes("лёд") || name.includes("лед") || name.includes("ice") || name.includes("frozen")) {
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, "#e0f7ff");
      grad.addColorStop(0.5, "#b3e5fc");
      grad.addColorStop(1, "#81d4fa");
      return grad;
    }
    
    // Неон / Neon
    if (name.includes("неон") || name.includes("neon") || name.includes("glow")) {
      const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.3, "#00ffff");
      grad.addColorStop(0.6, "#0080ff");
      grad.addColorStop(1, "#0040ff");
      return grad;
    }
    
    // Лава / Lava
    if (name.includes("лав") || name.includes("lava") || name.includes("magma") || name.includes("магм")) {
      const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size);
      grad.addColorStop(0, "#ff6600");
      grad.addColorStop(0.5, "#cc0000");
      grad.addColorStop(1, "#330000");
      return grad;
    }
    
    // Океан / Ocean
    if (name.includes("океан") || name.includes("ocean") || name.includes("sea") || name.includes("мор")) {
      const grad = ctx.createLinearGradient(0, 0, 0, size);
      grad.addColorStop(0, "#006994");
      grad.addColorStop(0.5, "#0077be");
      grad.addColorStop(1, "#003f5c");
      return grad;
    }
    
    // Закат / Sunset
    if (name.includes("закат") || name.includes("sunset") || name.includes("dusk")) {
      const grad = ctx.createLinearGradient(0, 0, 0, size);
      grad.addColorStop(0, "#ff6b6b");
      grad.addColorStop(0.3, "#ff8e53");
      grad.addColorStop(0.6, "#ffd93d");
      grad.addColorStop(1, "#6bcf7e");
      return grad;
    }
    
    // Космос / Space
    if (name.includes("космос") || name.includes("space") || name.includes("galaxy") || name.includes("галакт")) {
      const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size);
      grad.addColorStop(0, "#1a0033");
      grad.addColorStop(0.3, "#330066");
      grad.addColorStop(0.6, "#660099");
      grad.addColorStop(1, "#000000");
      return grad;
    }
    
    // Изумруд / Emerald
    if (name.includes("изумруд") || name.includes("emerald")) {
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, "#50c878");
      grad.addColorStop(0.5, "#3cb371");
      grad.addColorStop(1, "#2e8b57");
      return grad;
    }
    
    // Рубин / Ruby
    if (name.includes("рубин") || name.includes("ruby")) {
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, "#e0115f");
      grad.addColorStop(0.5, "#ff0040");
      grad.addColorStop(1, "#aa0033");
      return grad;
    }
    
    // Сапфир / Sapphire
    if (name.includes("сапфир") || name.includes("sapphire")) {
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, "#0f52ba");
      grad.addColorStop(0.5, "#0066cc");
      grad.addColorStop(1, "#003d99");
      return grad;
    }
    
    // Градиент базового цвета (если ничего не подошло)
    const rgb = hexToRgb(baseColor);
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, `rgb(${Math.min(255, rgb.r + 40)}, ${Math.min(255, rgb.g + 40)}, ${Math.min(255, rgb.b + 40)})`);
    grad.addColorStop(0.5, baseColor);
    grad.addColorStop(1, `rgb(${Math.max(0, rgb.r - 40)}, ${Math.max(0, rgb.g - 40)}, ${Math.max(0, rgb.b - 40)})`);
    return grad;
  }
  
  // Применяем графические эффекты
  function applyEffect(ctx: CanvasRenderingContext2D, size: number) {
    // Пикселизация для градиента
    if (backgroundType === "gradient" && activeEffects.pixelation) {
      applyPixelation(ctx, size, effectParams.pixelationSize);
    }

    // Пикселизация для фото
    if (backgroundType === "photo" && photoBackground.pixelation) {
      applyPixelation(ctx, size, photoBackground.pixelationSize);
    }
  }
  
  // Пикселизация
  function applyPixelation(ctx: CanvasRenderingContext2D, size: number, pixelSize: number) {
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCanvas.width = size;
    tempCanvas.height = size;
    tempCtx.drawImage(ctx.canvas, 0, 0);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, size / pixelSize, size / pixelSize);
    ctx.drawImage(ctx.canvas, 0, 0, size / pixelSize, size / pixelSize, 0, 0, size, size);
  }

  // Ordered Dithering (Bayer matrix) - превращает эмодзи в точечный паттерн
  function applyDithering(ctx: CanvasRenderingContext2D, size: number, intensity: number) {
    // Bayer 8x8 matrix для более детального dithering
    const bayerMatrix = [
      [0, 32, 8, 40, 2, 34, 10, 42],
      [48, 16, 56, 24, 50, 18, 58, 26],
      [12, 44, 4, 36, 14, 46, 6, 38],
      [60, 28, 52, 20, 62, 30, 54, 22],
      [3, 35, 11, 43, 1, 33, 9, 41],
      [51, 19, 59, 27, 49, 17, 57, 25],
      [15, 47, 7, 39, 13, 45, 5, 37],
      [63, 31, 55, 23, 61, 29, 53, 21]
    ];

    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    // Порог для создания точечного паттерна (чем выше intensity, тем больше точек исчезает)
    const alphaThreshold = intensity * 12;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;

        // Пропускаем полностью прозрачные пиксели
        if (data[idx + 3] < 10) continue;

        // Получаем значение из матрицы Байера (нормализуем к 0-1)
        const bayerValue = bayerMatrix[y % 8][x % 8] / 64;

        // Делаем пиксели прозрачными на основе порога - создаёт точечный эффект
        if (bayerValue < (alphaThreshold / 64)) {
          data[idx + 3] = 0; // Делаем пиксель прозрачным
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // Перерисовываем при изменении параметров
  useEffect(() => {
    if (!isMounted) return;
    
    try {
      drawAvatar();
    } catch (error) {
      console.error("Error drawing avatar:", error);
    }
  }, [
    isMounted,
    backgroundType, 
    selectedColor, 
    JSON.stringify(gradient), 
    JSON.stringify(activeEffects), 
    JSON.stringify(effectParams), 
    logoVolume, 
    JSON.stringify(emojiPattern), 
    customEmoji,
    emojiSeed,
    JSON.stringify(photoBackground)
  ]);
  
  // Скачивание PNG
  function downloadAvatar() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement("a");
    link.download = "avatar.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
  
  // Функция перемешивания эмодзи с анимацией тряски
  function shuffleEmojis() {
    setIsShaking(true);
    setEmojiSeed(Math.random() * 10000);
    
    // Если режим "сетка", автоматически переключаем на "случайно"
    if (emojiPattern.layout === "grid") {
      setEmojiPattern({ ...emojiPattern, layout: "random" });
    }
    
    // Сбрасываем анимацию через 500мс
    setTimeout(() => {
      setIsShaking(false);
    }, 500);
  }
  
  // Функция рандомизации всех настроек
  async function randomizeAll() {
    setIsGenerating(true);

    // Случайный выбор фона: 50% цвет, 30% градиент, 20% фото (если API ключ есть)
    const randomBg = Math.random();

    if (randomBg < 0.5) {
      // 50% - Однотонный цвет
      setBackgroundType("color");
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      setSelectedColor(randomColor);

      // Случайный уровень объёмности (0-10)
      const randomVolume = Math.floor(Math.random() * 11);
      setLogoVolume(randomVolume);
    } else if (randomBg < 0.8) {
      // 30% - Градиент
      setBackgroundType("gradient");
      setGradient(generateRandomGradient());

      // Случайная пикселизация (30% шанс)
      const usePixelation = Math.random() > 0.7;
      setActiveEffects({ pixelation: usePixelation });

      if (usePixelation) {
        // Случайный размер пикселя (6-96, чётные числа)
        const randomPixelSize = Math.floor(Math.random() * 46) * 2 + 6;
        setEffectParams({ pixelationSize: randomPixelSize });
      }
    } else if (PEXELS_API_KEY) {
      // 20% - Фото с калейдоскопом (только если есть API ключ)
      const randomSegments = [4, 6, 8, 10, 12][Math.floor(Math.random() * 5)];
      const randomZoom = Math.round((Math.random() * 2 + 0.5) * 10) / 10; // 0.5 - 2.5
      const randomRotation = Math.floor(Math.random() * 73) * 5; // 0 - 360, кратно 5
      const usePixelation = Math.random() > 0.7; // 30% шанс
      const randomPixelSize = Math.floor(Math.random() * 46) * 2 + 6; // 6-96
      setPhotoBackground(prev => ({
        ...prev,
        segments: randomSegments,
        zoom: randomZoom,
        rotation: randomRotation,
        pixelation: usePixelation,
        pixelationSize: randomPixelSize
      }));
      await fetchRandomPhoto();

      // Для фото эмодзи отключаем
      setEmojiPattern(prev => ({ ...prev, enabled: false }));
    } else {
      // Фоллбэк на цвет если нет API ключа
      setBackgroundType("color");
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      setSelectedColor(randomColor);
    }

    // Случайные настройки эмодзи (50% шанс включения) — только для цвета и градиента
    if (randomBg < 0.8) {
      const useEmoji = Math.random() > 0.5;
      const randomEmojiIndex = Math.floor(Math.random() * PRESET_EMOJIS.length);
      const randomEmojiSize = Math.floor(Math.random() * 16) * 4 + 160; // 160-220, кратно 4
      const useDithering = Math.random() > 0.7; // 30% шанс
      const randomDitheringIntensity = Math.floor(Math.random() * 5) + 1; // 1-5

      setEmojiPattern({
        enabled: useEmoji,
        emoji: PRESET_EMOJIS[randomEmojiIndex],
        size: randomEmojiSize,
        layout: "random",
        dithering: useDithering,
        ditheringIntensity: randomDitheringIntensity
      });
      setCustomEmoji("");
      setEmojiSeed(Math.random() * 10000);
    }

    // Сбрасываем анимацию через 800мс
    setTimeout(() => {
      setIsGenerating(false);
    }, 800);
  }

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 max-w-6xl w-full">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Левая панель - превью */}
        <div className="flex-shrink-0 flex flex-col items-center md:items-start">
          <div className="mb-4 text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-bold text-[#3f0030] mb-1 md:mb-2">Генератор аватарок</h2>
            <p className="text-sm md:text-base text-gray-600">1080×1080 px</p>
          </div>

          {/* Превью в кружочке */}
          <div className={`relative w-48 h-48 md:w-64 md:h-64 mb-4 md:mb-6 ${isShaking ? 'animate-shake' : ''}`}>
            {/* Кнопка рандомизации в верхнем правом углу */}
            <button
              onClick={randomizeAll}
              className="absolute -top-2 -right-2 z-10 w-10 h-10 md:w-12 md:h-12 bg-[#300247] hover:bg-[#3f0030] text-white rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              title="Случайные настройки"
            >
              <Sparkles size={20} className="md:hidden" fill="#C16FFB" stroke="#C16FFB" strokeWidth={0} />
              <Sparkles size={24} className="hidden md:block" fill="#C16FFB" stroke="#C16FFB" strokeWidth={0} />
            </button>

            <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-gray-200">
              <canvas
                ref={canvasRef}
                width={1080}
                height={1080}
                className="w-full h-full object-cover"
              />

              {/* Оверлей с эффектом генерации */}
              {isGenerating && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-70 animate-generating" />
              )}
            </div>
          </div>

          {/* Кнопка скачивания */}
          <button
            onClick={downloadAvatar}
            className="w-48 md:w-64 bg-[#ff8fda] hover:bg-[#ff7ad0] text-white font-medium py-2.5 md:py-3 px-4 md:px-6 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
          >
            <Download size={18} className="md:hidden" />
            <Download size={20} className="hidden md:block" />
            Скачать PNG
          </button>
        </div>
        
        {/* Правая панель - настройки */}
        <div className="flex-1 space-y-4 md:space-y-6">
          {/* Переключатель вкладок */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">Настройки</label>
            <div className="flex gap-1 md:gap-2 p-1 bg-gray-100 rounded-lg overflow-x-auto">
              <button
                onClick={() => setSettingsTab("color")}
                className={`flex-1 min-w-fit py-1.5 md:py-2 px-2 md:px-4 rounded-md text-sm md:text-base font-medium transition-all ${
                  settingsTab === "color"
                    ? "bg-white text-[#3f0030] shadow"
                    : "text-gray-600"
                }`}
              >
                Цвет
              </button>
              <button
                onClick={() => setSettingsTab("gradient")}
                className={`flex-1 min-w-fit py-1.5 md:py-2 px-2 md:px-4 rounded-md text-sm md:text-base font-medium transition-all ${
                  settingsTab === "gradient"
                    ? "bg-white text-[#3f0030] shadow"
                    : "text-gray-600"
                }`}
              >
                Градиент
              </button>
              <button
                onClick={() => setSettingsTab("emoji")}
                className={`flex-1 min-w-fit py-1.5 md:py-2 px-2 md:px-4 rounded-md text-sm md:text-base font-medium transition-all ${
                  settingsTab === "emoji"
                    ? "bg-white text-[#3f0030] shadow"
                    : "text-gray-600"
                }`}
              >
                Эмодзи
              </button>
              <button
                onClick={() => setSettingsTab("photo")}
                className={`flex-1 min-w-fit py-1.5 md:py-2 px-2 md:px-4 rounded-md text-sm md:text-base font-medium transition-all ${
                  settingsTab === "photo"
                    ? "bg-white text-[#3f0030] shadow"
                    : "text-gray-600"
                }`}
              >
                Фото
              </button>
            </div>
          </div>
          
          {/* Вкладка: Цвет */}
          {settingsTab === "color" && (
            <>
              {/* Выбор цвета */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">Выбор цвета</label>
                <div className="grid grid-cols-6 gap-1.5 md:gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setBackgroundType("color");
                      }}
                      className={`w-full h-12 rounded-lg transition-all ${
                        selectedColor === color && backgroundType === "color"
                          ? "ring-4 ring-[#ff8fda] ring-offset-2 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{
                        backgroundColor: color,
                        border: color === "#FFFFFF" ? "2px solid #e5e7eb" : "none"
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              
              {/* Объёмность логотипа */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Объёмность логотипа</label>
                <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Уровень объёма: {logoVolume}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={logoVolume}
                    onChange={(e) => setLogoVolume(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ff8fda]"
                  />
                  <p className="text-xs text-gray-500 mt-1">0 = плоский, 10 = максимальная объёмность</p>
                </div>
              </div>
            </>
          )}
          
          {/* Вкладка: Градиент */}
          {settingsTab === "gradient" && (
            <>
              {/* Генератор градиента */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Градиент</label>
                <button
                  onClick={() => {
                    setGradient(generateRandomGradient());
                    setBackgroundType("gradient");
                  }}
                  className="w-full bg-[#c16ffb] hover:bg-[#b060eb] text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw size={20} />
                  Сгенерировать новый
                </button>
                <div className="mt-3 text-sm text-gray-600">
                  Цвета: {gradient.stops.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1">
                      <span
                        className="inline-block w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: s.color }}
                      />
                      {i < gradient.stops.length - 1 && ", "}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Пикселизация со свитчем */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Пикселизация</label>
                  <button
                    onClick={() => setActiveEffects({
                      ...activeEffects,
                      pixelation: !activeEffects.pixelation
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      activeEffects.pixelation ? "bg-[#ff8fda]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        activeEffects.pixelation ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                
                {/* Параметры эффекта - всегда видны, но с прозрачностью когда выключено */}
                <div 
                  className={`bg-gray-50 rounded-xl p-3 md:p-4 transition-opacity ${
                    activeEffects.pixelation ? "opacity-100" : "opacity-50 pointer-events-none"
                  }`}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Размер пикселя: {effectParams.pixelationSize}px
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="96"
                    step="2"
                    value={effectParams.pixelationSize}
                    onChange={(e) => setEffectParams({
                      ...effectParams,
                      pixelationSize: Number(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ff8fda]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Размер одного пикселя</p>
                </div>
              </div>
            </>
          )}
          
          {/* Вкладка: Эмодзи */}
          {settingsTab === "emoji" && (
            <>
              {/* Включение паттерна со свитчем */}
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">Паттерн из эмодзи</label>
                <button
                  onClick={() => setEmojiPattern({
                    ...emojiPattern,
                    enabled: !emojiPattern.enabled
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    emojiPattern.enabled ? "bg-[#ff8fda]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emojiPattern.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              
              {/* Интерфейс выбора эмодзи - всегда виден, но с прозрачностью когда выключен */}
              <div 
                className={`space-y-4 transition-opacity ${
                  emojiPattern.enabled ? "opacity-100" : "opacity-50 pointer-events-none"
                }`}
              >
                {/* Сетка предустановленных эмодзи с пагинацией */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Выбор эмодзи</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEmojiPage(Math.max(0, emojiPage - 1))}
                        disabled={emojiPage === 0}
                        className={`p-1 rounded-md transition-colors ${
                          emojiPage === 0
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="text-sm text-gray-600">
                        {emojiPage + 1} / {Math.ceil(PRESET_EMOJIS.length / 20)}
                      </span>
                      <button
                        onClick={() => setEmojiPage(Math.min(Math.floor(PRESET_EMOJIS.length / 20), emojiPage + 1))}
                        disabled={emojiPage >= Math.floor(PRESET_EMOJIS.length / 20)}
                        className={`p-1 rounded-md transition-colors ${
                          emojiPage >= Math.floor(PRESET_EMOJIS.length / 20)
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5 md:gap-2">
                    {PRESET_EMOJIS.slice(emojiPage * 20, (emojiPage + 1) * 20).map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setEmojiPattern({ ...emojiPattern, emoji });
                          setCustomEmoji("");
                        }}
                        className={`w-full h-9 md:h-10 rounded-lg text-lg md:text-xl flex items-center justify-center transition-all ${
                          emojiPattern.emoji === emoji && !customEmoji
                            ? "ring-2 md:ring-4 ring-[#ff8fda] ring-offset-1 scale-110 bg-gray-100"
                            : "bg-gray-50 hover:bg-gray-100 hover:scale-105"
                        }`}
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Поле для своего эмодзи */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Или введите своё</label>
                  <input
                    type="text"
                    value={customEmoji}
                    onChange={(e) => setCustomEmoji(e.target.value)}
                    placeholder="Введите эмодзи..."
                    maxLength={2}
                    className="w-full px-4 py-2 text-2xl text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff8fda] focus:border-transparent"
                  />
                </div>
                
                {/* Кнопка перемешать */}
                <button
                  onClick={shuffleEmojis}
                  className="w-full bg-[#c16ffb] hover:bg-[#b060eb] text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw size={18} />
                  Перемешать эмодзи
                </button>
                
                {/* Выбор типа расположения: случайно/сетка */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">Расположение эмодзи</label>
                  <div className="flex gap-1 md:gap-2 p-1 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => setEmojiPattern({ ...emojiPattern, layout: "random" })}
                      className={`flex-1 py-1.5 md:py-2 px-3 md:px-4 rounded-md text-sm md:text-base font-medium transition-all ${
                        emojiPattern.layout === "random"
                          ? "bg-white text-[#3f0030] shadow"
                          : "text-gray-600"
                      }`}
                    >
                      Случайно
                    </button>
                    <button
                      onClick={() => setEmojiPattern({ ...emojiPattern, layout: "grid" })}
                      className={`flex-1 py-1.5 md:py-2 px-3 md:px-4 rounded-md text-sm md:text-base font-medium transition-all ${
                        emojiPattern.layout === "grid"
                          ? "bg-white text-[#3f0030] shadow"
                          : "text-gray-600"
                      }`}
                    >
                      Сетка
                    </button>
                  </div>
                </div>
                
                {/* Ползунок размера */}
                <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Размер эмодзи: {emojiPattern.size}px
                  </label>
                  <input
                    type="range"
                    min="124"
                    max="256"
                    step="4"
                    value={emojiPattern.size}
                    onChange={(e) => setEmojiPattern({
                      ...emojiPattern,
                      size: Number(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ff8fda]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Размер влияет на плотность паттерна</p>
                </div>

                {/* Dithering эффект */}
                <div>
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <label className="text-sm font-medium text-gray-700">Dithering</label>
                    <button
                      onClick={() => setEmojiPattern({
                        ...emojiPattern,
                        dithering: !emojiPattern.dithering
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        emojiPattern.dithering ? "bg-[#ff8fda]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          emojiPattern.dithering ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className={`bg-gray-50 rounded-xl p-3 md:p-4 transition-opacity ${
                    emojiPattern.dithering ? "opacity-100" : "opacity-50 pointer-events-none"
                  }`}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Интенсивность: {emojiPattern.ditheringIntensity}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={emojiPattern.ditheringIntensity}
                      onChange={(e) => setEmojiPattern({
                        ...emojiPattern,
                        ditheringIntensity: Number(e.target.value)
                      })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ff8fda]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Вкладка: Фото */}
          {settingsTab === "photo" && (
            <>
              {/* Предупреждение если нет API ключа */}
              {!PEXELS_API_KEY && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    API ключ Pexels не настроен. Создайте файл <code className="bg-yellow-100 px-1 rounded">.env</code> и добавьте:
                  </p>
                  <code className="block mt-2 text-xs bg-yellow-100 p-2 rounded">
                    VITE_PEXELS_API_KEY=ваш_ключ
                  </code>
                  <p className="text-xs text-yellow-600 mt-2">
                    Получить бесплатный ключ: <a href="https://www.pexels.com/api/" target="_blank" rel="noopener noreferrer" className="underline">pexels.com/api</a>
                  </p>
                </div>
              )}

              {/* Кнопка загрузки фото */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Калейдоскоп из фото</label>
                  <button
                    onClick={fetchRandomPhoto}
                    disabled={photoBackground.loading || !PEXELS_API_KEY}
                    className="w-10 h-10 bg-[#c16ffb] hover:bg-[#b060eb] text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Новое фото"
                  >
                    <RefreshCw size={20} className={photoBackground.loading ? "animate-spin" : ""} />
                  </button>
                </div>
                {photoBackground.photographer && (
                  <p className="text-xs text-gray-500">
                    Фото: {photoBackground.photographer} / Pexels
                  </p>
                )}
              </div>

              {/* Настройки калейдоскопа */}
              <div className={`bg-gray-50 rounded-xl p-3 md:p-4 space-y-4 transition-opacity ${
                photoBackground.imageData ? "opacity-100" : "opacity-50"
              }`}>
                {/* Сегменты */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Сегменты: {photoBackground.segments}
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="12"
                    step="2"
                    value={photoBackground.segments}
                    onChange={(e) => setPhotoBackground({
                      ...photoBackground,
                      segments: Number(e.target.value)
                    })}
                    disabled={!photoBackground.imageData}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ff8fda] disabled:cursor-not-allowed"
                  />
                </div>

                {/* Масштаб */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Масштаб: {photoBackground.zoom.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={photoBackground.zoom}
                    onChange={(e) => setPhotoBackground({
                      ...photoBackground,
                      zoom: Number(e.target.value)
                    })}
                    disabled={!photoBackground.imageData}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ff8fda] disabled:cursor-not-allowed"
                  />
                </div>

                {/* Поворот */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Поворот: {photoBackground.rotation}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={photoBackground.rotation}
                    onChange={(e) => setPhotoBackground({
                      ...photoBackground,
                      rotation: Number(e.target.value)
                    })}
                    disabled={!photoBackground.imageData}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ff8fda] disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Пикселизация для фото */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Пикселизация</label>
                  <button
                    onClick={() => setPhotoBackground({
                      ...photoBackground,
                      pixelation: !photoBackground.pixelation
                    })}
                    disabled={!photoBackground.imageData}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                      photoBackground.pixelation ? "bg-[#ff8fda]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        photoBackground.pixelation ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className={`bg-gray-50 rounded-xl p-3 md:p-4 transition-opacity ${
                  photoBackground.pixelation && photoBackground.imageData ? "opacity-100" : "opacity-50 pointer-events-none"
                }`}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Размер пикселя: {photoBackground.pixelationSize}px
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="96"
                    step="2"
                    value={photoBackground.pixelationSize}
                    onChange={(e) => setPhotoBackground({
                      ...photoBackground,
                      pixelationSize: Number(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ff8fda]"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Интерполяция цвета в градиенте
function interpolateGradientColor(stops: GradientStop[], position: number): { r: number, g: number, b: number } {
  if (position <= 0) return hexToRgb(stops[0].color);
  if (position >= 1) return hexToRgb(stops[stops.length - 1].color);
  
  for (let i = 0; i < stops.length - 1; i++) {
    if (position >= stops[i].position && position <= stops[i + 1].position) {
      const t = (position - stops[i].position) / (stops[i + 1].position - stops[i].position);
      const color1 = hexToRgb(stops[i].color);
      const color2 = hexToRgb(stops[i + 1].color);
      return {
        r: Math.round(color1.r + t * (color2.r - color1.r)),
        g: Math.round(color1.g + t * (color2.g - color1.g)),
        b: Math.round(color1.b + t * (color2.b - color1.b))
      };
    }
  }
  
  return hexToRgb(stops[0].color);
}

// Преобразование HEX в RGB
function hexToRgb(hex: string): { r: number, g: number, b: number } {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;
  return { r, g, b };
}