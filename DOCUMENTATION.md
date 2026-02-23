# Документация проекта "Генератор аватарок"

## Оглавление
1. [Обзор проекта](#обзор-проекта)
2. [Архитектура](#архитектура)
3. [Основные компоненты](#основные-компоненты)
4. [Параметры и настройки](#параметры-и-настройки)
5. [Цветовая система](#цветовая-система)
6. [Градиенты](#градиенты)
7. [Эффекты](#эффекты)
8. [Эмодзи-паттерны](#эмодзи-паттерны)
9. [Логотип и объемность](#логотип-и-объемность)
10. [Функции отрисовки](#функции-отрисовки)
11. [Экспорт](#экспорт)
12. [Расширение функционала](#расширение-функционала)

---

## Обзор проекта

**Генератор аватарок** — это веб-приложение на React для создания квадратных аватарок размером **1080×1080 пикселей** с логотипом компании.

### Основные возможности:
- ✅ Выбор фона: однотонный цвет или случайный градиент (3 цвета)
- ✅ Автоматическая адаптация цвета логотипа (светлые фоны → темные логотипы и наоборот)
- ✅ 3D-эффект объемности логотипа (только для однотонных фонов)
- ✅ Три типа градиентов: radial, linear, diamond
- ✅ Эффект пикселизации для градиентов
- ✅ Паттерны из эмодзи с настраиваемым размером (124-256 пикселей)
- ✅ Два режима расположения эмодзи: случайное и сеточное
- ✅ Экспорт в PNG формате
- ✅ Кнопка рандомизации всех настроек

---

## Архитектура

### Структура файлов
```
/src
  /app
    /components
      AvatarGenerator.tsx    # Основной компонент генератора
      /figma
        ImageWithFallback.tsx # Компонент для изображений (защищен)
    /imports
      svg-pdfdvkp3zc.ts       # SVG-пути логотипа
    /styles
      fonts.css               # Импорты шрифтов
      theme.css               # CSS-токены и стили
    App.tsx                   # Точка входа приложения
```

### Технологический стек
- **React** 18+ с TypeScript
- **Canvas API** для рендеринга
- **Tailwind CSS v4** для стилизации
- **Lucide React** для иконок

---

## Основные компоненты

### AvatarGenerator.tsx

Главный и единственный компонент приложения. Содержит всю логику генерации, UI и управления состоянием.

#### Основные состояния (useState):

```typescript
// Монтирование
const [isMounted, setIsMounted] = useState(false);

// Тип фона: "color" или "gradient"
const [backgroundType, setBackgroundType] = useState<BackgroundType>("color");

// Выбранный цвет (для однотонного фона)
const [selectedColor, setSelectedColor] = useState(COLORS[1]); // #FF8FDA

// Настройки градиента
const [gradient, setGradient] = useState<Gradient>(() => generateRandomGradient());

// Активные графические эффекты
const [activeEffects, setActiveEffects] = useState<ActiveEffects>({
  pixelation: false
});

// Параметры эффектов
const [effectParams, setEffectParams] = useState<EffectParams>({
  pixelationSize: 24
});

// Объемность логотипа (0-10)
const [logoVolume, setLogoVolume] = useState(0);

// Настройки эмодзи-паттерна
const [emojiPattern, setEmojiPattern] = useState<EmojiPattern>({
  enabled: false,
  emoji: "✨",
  size: 124,
  layout: "random"
});

// Пользовательский эмодзи (если вводится вручную)
const [customEmoji, setCustomEmoji] = useState("");

// Seed для генерации случайного расположения эмодзи
const [emojiSeed, setEmojiSeed] = useState(0);

// Текущая страница в пагинации эмодзи
const [emojiPage, setEmojiPage] = useState(0);

// Активная вкладка настроек: "color", "gradient", "emoji"
const [settingsTab, setSettingsTab] = useState<SettingsTab>("color");

// Анимация тряски при перемешивании эмодзи
const [isShaking, setIsShaking] = useState(false);

// Эффект генерации (белый градиент) при рандомизации
const [isGenerating, setIsGenerating] = useState(false);
```

#### Canvas Reference:
```typescript
const canvasRef = useRef<HTMLCanvasElement>(null);
```

---

## Параметры и настройки

### Интерфейс состоит из трёх вкладок:

#### 1. Вкладка "Цвет" (`settingsTab === "color"`)
- **Выбор цвета**: сетка 6×2 из 12 цветов
- **Объёмность логотипа**: ползунок 0-10 (только для однотонных фонов)

#### 2. Вкладка "Градиент" (`settingsTab === "gradient"`)
- **Кнопка генерации**: создает новый случайный градиент
- **Отображение цветов**: показывает 3 цвета текущего градиента
- **Переключатель пикселизации**: вкл/выкл эффекта
- **Размер пикселя**: ползунок 6-96 пикселей (четные числа)

#### 3. Вкладка "Эмодзи" (`settingsTab === "emoji"`)
- **Переключатель паттерна**: вкл/выкл эмодзи-слоя
- **Сетка эмодзи**: 10×2 = 20 эмодзи на страницу
- **Пагинация**: листание страниц с эмодзи
- **Ввод своего эмодзи**: текстовое поле (макс 2 символа)
- **Кнопка перемешивания**: новое расположение эмодзи
- **Тип расположения**: "Случайно" или "Сетка"
- **Размер эмодзи**: ползунок 124-256 пикселей (кратно 4)

### Кнопка рандомизации (круглая, правый верхний угол превью):
- Иконка: Sparkles (залитая, без обводки)
- Цвет фона: `#300247`
- Цвет иконки: `#C16FFB`
- Функция: `randomizeAll()` — генерирует случайные настройки для всех параметров

---

## Цветовая система

### Палитра (12 цветов)

```typescript
const COLORS = [
  // Светлые (6 цветов)
  "#FFFFFF", // Белый
  "#FF8FDA", // Розовый
  "#C16FFB", // Фиолетовый
  "#FF965F", // Оранжевый
  "#FACF61", // Желтый
  "#B8EE49", // Зеленый
  
  // Темные (6 цветов)
  "#15181F", // Почти черный
  "#3F0030", // Темно-малиновый
  "#300247", // Темно-фиолетовый
  "#381300", // Темно-коричневый
  "#2A1E01", // Темно-желтый
  "#172104"  // Темно-зеленый
];
```

### Светлые цвета для градиентов (без белого)

```typescript
const LIGHT_COLORS = [
  "#FF8FDA", 
  "#C16FFB", 
  "#FF965F", 
  "#FACF61", 
  "#B8EE49"
];
```

### Цветовые пары (фон → логотип)

```typescript
const COLOR_PAIRS: { [key: string]: string } = {
  // Светлые фоны → Темные логотипы
  "#FFFFFF": "#15181F",
  "#FF8FDA": "#3F0030",
  "#C16FFB": "#300247",
  "#FF965F": "#381300",
  "#FACF61": "#2A1E01",
  "#B8EE49": "#172104",
  
  // Темные фоны → Светлые логотипы
  "#15181F": "#FFFFFF",
  "#3F0030": "#FF8FDA",
  "#300247": "#C16FFB",
  "#381300": "#FF965F",
  "#2A1E01": "#FACF61",
  "#172104": "#B8EE49"
};
```

**Логика определения цвета логотипа:**
1. Если фон ��� однотонный цвет: используется соответствующая пара из `COLOR_PAIRS`
2. Если фон — градиент: берется первый цвет градиента и ищется его пара
3. Если пара не найдена: используется функция `getLogoColor()`, которая вычисляет яркость (luminance) и возвращает черный или белый

---

## Градиенты

### Типы градиентов

```typescript
type GradientType = "radial" | "linear" | "diamond";
```

#### 1. Radial (Радиальный)
- Создается через `ctx.createRadialGradient()`
- Параметры: `centerX`, `centerY`, `radius`
- Расширяется от центральной точки

#### 2. Linear (Линейный)
- Создается через `ctx.createLinearGradient()`
- Параметры: `angle` (угол в радианах)
- Направление определяется случайным углом от 0 до 2π

#### 3. Diamond (Ромбовидный)
- Реализуется через попикселную отрисовку (`createImageData`)
- Использует манхэттенское расстояние: `Math.abs(x - cx) + Math.abs(y - cy)`
- Со��дает ромбовидную форму распространения цвета

### Структура градиента

```typescript
interface GradientStop {
  color: string;      // Hex-цвет
  position: number;   // Позиция от 0 до 1
}

interface Gradient {
  stops: GradientStop[];  // Всегда 3 цвета
  centerX: number;        // 0.2-0.8
  centerY: number;        // 0.2-0.8
  radius: number;         // 0.5-1.0
  type: GradientType;     // "radial" | "linear" | "diamond"
  angle: number;          // Угол для linear (0 - 2π)
}
```

### Генерация случайного градиента

```typescript
function generateRandomGradient(): Gradient {
  const numStops = 3; // Всегда 3 цвета
  const stops: GradientStop[] = [];
  
  // Выбираем 3 случайных цвета из LIGHT_COLORS
  const selectedColors = [...LIGHT_COLORS]
    .sort(() => Math.random() - 0.5)
    .slice(0, numStops);
  
  for (let i = 0; i < numStops; i++) {
    stops.push({
      color: selectedColors[i],
      position: i / (numStops - 1) // 0, 0.5, 1
    });
  }
  
  // Случайный тип
  const types: GradientType[] = ["radial", "linear", "diamond"];
  const randomType = types[Math.floor(Math.random() * types.length)];
  
  return {
    stops,
    centerX: Math.random() * 0.6 + 0.2,  // 0.2-0.8
    centerY: Math.random() * 0.6 + 0.2,  // 0.2-0.8
    radius: Math.random() * 0.5 + 0.5,   // 0.5-1.0
    type: randomType,
    angle: Math.random() * Math.PI * 2   // 0-2π
  };
}
```

---

## Эффекты

### Пикселизация

**Работает только для градиентов!**

#### Параметры:
- **Включение/выключение**: `activeEffects.pixelation` (boolean)
- **Размер пикселя**: `effectParams.pixelationSize` (6-96, четные числа)

#### Алгоритм:

```typescript
function applyPixelation(ctx: CanvasRenderingContext2D, size: number, pixelSize: number) {
  // 1. Копируем canvas во временный
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = size;
  tempCanvas.height = size;
  tempCtx.drawImage(ctx.canvas, 0, 0);
  
  // 2. Отключаем сглаживание
  ctx.imageSmoothingEnabled = false;
  
  // 3. Рисуем уменьшенную версию
  ctx.drawImage(tempCanvas, 0, 0, size / pixelSize, size / pixelSize);
  
  // 4. Растягиваем обратно (создается эффект пикселей)
  ctx.drawImage(ctx.canvas, 0, 0, size / pixelSize, size / pixelSize, 0, 0, size, size);
}
```

**Вызывается в `applyEffect()` перед отрисовкой эмодзи и логотипа**

---

## Эмодзи-паттерны

### Параметры

```typescript
interface EmojiPattern {
  enabled: boolean;           // Включен ли паттерн
  emoji: string;              // Выбранный эмодзи (1-2 символа)
  size: number;               // Размер 124-256 пикселей (кратно 4)
  layout: "random" | "grid";  // Тип расположения
}
```

### Библиотека эмодзи

В константе `PRESET_EMOJIS` содержится **280+ эмодзи**, разбитых по категориям:
- Звезды и блеск (10 эмодзи)
- Сердца и эмоции (20 эмодзи)
- Природа (20 эмодзи)
- Небо и погода (30 эмодзи)
- Животные (50 эмодзи)
- Еда и напитки (60 эмодзи)
- Десерты и сладости (20 эмодзи)
- Активности и спорт (20 эмодзи)
- Музыка и искусство (20 эмодзи)
- Объекты и символы (20 эмодзи)
- Знаки и символы (30 эмодзи)

**Пагинация:** 20 эмодзи на страницу (сетка 10×2)

### Режимы расположения

#### 1. Сетка (`layout === "grid"`)
- Эмодзи расположены строго по сетке
- Расстояние между эмодзи: `spacing = emojiSize * 1.5`
- Паттерн центрирован относительно canvas

#### 2. Случайное (`layout === "random"`)
- Базируется на сетке, но с рандомными смещениями
- Смещение: `(pseudoRandom(seed) - 0.5) * spacing * 0.5`
- Использует детерминированную генерацию на основе `emojiSeed`

### Центрирование паттерна

Паттерн всегда масштабируется из центра canvas:

```typescript
const spacing = emojiSize * 1.5;
const cols = Math.ceil(size / spacing) + 2; // +2 для запаса
const rows = Math.ceil(size / spacing) + 2;

// Вычисляем смещения для центрирования
const centerX = size / 2;
const centerY = size / 2;
const offsetX = centerX - ((cols - 1) * spacing) / 2;
const offsetY = centerY - ((rows - 1) * spacing) / 2;

// Применяем к каждому эмодзи
x = col * spacing + offsetX;
y = row * spacing + offsetY;
```

### Детерминированная рандомизация

Для стабильного "случайного" размещения используется функция:

```typescript
const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x); // Возвращает 0-1
};
```

**Seeds для позиций:**
```typescript
const seed1 = row * 1000 + col + emojiSeed;  // Для X-смещения
const seed2 = row * 2000 + col * 3 + emojiSeed; // Для Y-смещения
```

### Функция перемешивания

```typescript
function shuffleEmojis() {
  setIsShaking(true);
  setEmojiSeed(Math.random() * 10000); // Новый seed
  
  // Автопереключение с "сетка" на "случайно"
  if (emojiPattern.layout === "grid") {
    setEmojiPattern({ ...emojiPattern, layout: "random" });
  }
  
  setTimeout(() => setIsShaking(false), 500); // Анимация 500мс
}
```

---

## Логотип и объемность

### Размер логотипа

- Логотип занимает **84.5%** от размера аватарки
- Размер аватарки: **1080×1080 пикселей**
- Размер логотипа: **1080 × 0.845 = 912.6 пикселей**
- Центрирован: `offset = (size - logoSize) / 2`

### SVG-пути

Логотип состоит из **двух SVG-путей**, импортируемых из файла:

```typescript
import svgPaths from "../../imports/svg-pdfdvkp3zc";

// В коде:
const path1 = new Path2D(svgPaths.p22ef19f0);
const path2 = new Path2D(svgPaths.p6813300);
```

### Объемность (3D-эффект)

**Работает только для однотонных фонов!** Для градиентов `effectiveLogoVolume = 0`.

#### Параметры:
- **Уровень**: 0-10 (ползунок)
- **Множитель**: `volumeMultiplier = volume * 10`

#### Тень (под логотипом):

```typescript
ctx.shadowColor = `rgba(0, 0, 0, ${Math.min(1, 0.008 * volumeMultiplier)})`;
ctx.shadowBlur = 0.8 * volumeMultiplier;      // 8 при volume=1, 80 при volume=10
ctx.shadowOffsetX = 0.3 * volumeMultiplier;   // 3 при volume=1, 30 при volume=10
ctx.shadowOffsetY = 0.3 * volumeMultiplier;   // 3 при volume=1, 30 при volume=10
ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, 0.004 * volumeMultiplier)})`;
```

#### Блик (поверх логотипа):

```typescript
ctx.globalCompositeOperation = "overlay";

const highlightGrad = ctx.createRadialGradient(30, 30, 0, 60, 60, 80);
highlightGrad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, 0.06 * volumeMultiplier)})`);
highlightGrad.addColorStop(0.5, `rgba(255, 255, 255, ${Math.min(1, 0.02 * volumeMultiplier)})`);
highlightGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
```

---

## Функции отрисовки

### Основная функция: `drawAvatar()`

Порядок отрисовки слоев (снизу вверх):

1. **Очистка canvas**: `ctx.clearRect(0, 0, size, size)`
2. **Фон** (цвет или градиент)
3. **Графические эффекты** (пикселизация): `applyEffect(ctx, size)`
4. **Эмодзи-паттерн**: `drawEmojiPattern(ctx, size)`
5. **Логотип**: `drawLogo(ctx, size, logoColor, effectiveLogoVolume)`

### Функция отрисовки фона

```typescript
// Однотонный цвет
if (backgroundType === "color") {
  ctx.fillStyle = selectedColor;
  ctx.fillRect(0, 0, size, size);
}

// Градиент
else {
  if (gradient.type === "radial") { /* ... */ }
  else if (gradient.type === "linear") { /* ... */ }
  else if (gradient.type === "diamond") { /* ... */ }
}
```

### Функция отрисовки логотипа

```typescript
function drawLogo(ctx: CanvasRenderingContext2D, size: number, color: string, volume: number) {
  const logoSize = size * 0.845;
  const offset = (size - logoSize) / 2;
  
  // Трансформация для центрирования и масштабирования
  ctx.save();
  ctx.translate(offset, offset);
  ctx.scale(logoSize / 120, logoSize / 120);
  
  // 1. Тень (если volume > 0)
  if (volume > 0) {
    // ... настройка тени
    ctx.fill(path1Shadow);
    ctx.fill(path2Shadow);
  }
  
  // 2. Основной логотип
  ctx.fillStyle = color;
  ctx.fill(path1);
  ctx.fill(path2);
  
  // 3. Блик (если volume > 0)
  if (volume > 0) {
    ctx.globalCompositeOperation = "overlay";
    // ... радиальный градиент
    ctx.fill(path1);
    ctx.fill(path2);
  }
  
  ctx.restore();
}
```

### Функция отрисовки эмодзи

```typescript
function drawEmojiPattern(ctx: CanvasRenderingContext2D, size: number) {
  const emoji = customEmoji || emojiPattern.emoji;
  const emojiSize = emojiPattern.size;
  
  ctx.save();
  ctx.font = `${emojiSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = 1.0;
  
  const spacing = emojiSize * 1.5;
  const cols = Math.ceil(size / spacing) + 2;
  const rows = Math.ceil(size / spacing) + 2;
  
  // Центрирование
  const offsetX = size / 2 - ((cols - 1) * spacing) / 2;
  const offsetY = size / 2 - ((rows - 1) * spacing) / 2;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let x, y;
      
      if (emojiPattern.layout === "grid") {
        x = col * spacing + offsetX;
        y = row * spacing + offsetY;
      } else {
        // Случайные смещения
        const randomOffsetX = (pseudoRandom(seed1) - 0.5) * spacing * 0.5;
        const randomOffsetY = (pseudoRandom(seed2) - 0.5) * spacing * 0.5;
        x = col * spacing + offsetX + randomOffsetX;
        y = row * spacing + offsetY + randomOffsetY;
      }
      
      // Проверка границ
      if (x > -emojiSize && x < size + emojiSize && 
          y > -emojiSize && y < size + emojiSize) {
        ctx.fillText(emoji, x, y);
      }
    }
  }
  
  ctx.restore();
}
```

---

## Экспорт

### Формат
- **Размер**: 1080×1080 пикселей
- **Формат**: PNG
- **Имя файла**: `avatar.png`

### Функция экспорта

```typescript
function downloadAvatar() {
  const canvas = canvasRef.current;
  if (!canvas) return;
  
  const link = document.createElement("a");
  link.download = "avatar.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
```

**Кнопка скачивания:**
- Цвет: `#ff8fda` (розовый)
- Иконка: Download (из lucide-react)
- Расположение: под превью аватарки

---

## Рандомизация

### Функция `randomizeAll()`

Создает полностью случайные настройки для аватарки:

```typescript
function randomizeAll() {
  setIsGenerating(true); // Запуск анимации
  
  // 1. Фон: 60% цвет, 40% градиент
  const useGradient = Math.random() > 0.6;
  
  if (useGradient) {
    setBackgroundType("gradient");
    setGradient(generateRandomGradient());
    
    // Пикселизация: 30% шанс
    const usePixelation = Math.random() > 0.7;
    setActiveEffects({ pixelation: usePixelation });
    
    if (usePixelation) {
      // Размер пикселя: 6-96 (четные)
      const randomPixelSize = Math.floor(Math.random() * 46) * 2 + 6;
      setEffectParams({ pixelationSize: randomPixelSize });
    }
  } else {
    setBackgroundType("color");
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setSelectedColor(randomColor);
    
    // Объемность: 0-10
    const randomVolume = Math.floor(Math.random() * 11);
    setLogoVolume(randomVolume);
  }
  
  // 2. Эмодзи: 50% шанс включения
  const useEmoji = Math.random() > 0.5;
  const randomEmojiIndex = Math.floor(Math.random() * PRESET_EMOJIS.length);
  const randomEmojiSize = Math.floor(Math.random() * 34) * 4 + 124; // 124-256
  
  setEmojiPattern({
    enabled: useEmoji,
    emoji: PRESET_EMOJIS[randomEmojiIndex],
    size: randomEmojiSize,
    layout: "random"
  });
  setCustomEmoji("");
  setEmojiSeed(Math.random() * 10000);
  
  // 3. Сброс анимации через 800мс
  setTimeout(() => setIsGenerating(false), 800);
}
```

---

## Расширение функционала

### Добавление новых цветов

1. Добавьте цвет в массив `COLORS`:
```typescript
const COLORS = [
  // ... существующие
  "#NEW_COLOR" // Новый цвет
];
```

2. Если цвет светлый, добавьте его в `LIGHT_COLORS` (для градиентов):
```typescript
const LIGHT_COLORS = [
  // ... существующие
  "#NEW_LIGHT_COLOR"
];
```

3. Добавьте цветовую пару в `COLOR_PAIRS`:
```typescript
const COLOR_PAIRS = {
  // ... существующие
  "#NEW_COLOR": "#CONTRASTING_COLOR",
  "#CONTRASTING_COLOR": "#NEW_COLOR"
};
```

### Добавление новых эффектов

1. Добавьте поле в интерфейс `ActiveEffects`:
```typescript
interface ActiveEffects {
  pixelation: boolean;
  newEffect: boolean; // Новый эффект
}
```

2. Добавьте параметры в `EffectParams` (если нужны):
```typescript
interface EffectParams {
  pixelationSize: number;
  newEffectParam: number; // Параметр нового эффекта
}
```

3. Создайте функцию эффекта:
```typescript
function applyNewEffect(ctx: CanvasRenderingContext2D, size: number, param: number) {
  // Ваша логика эффекта
}
```

4. Вызовите в `applyEffect()`:
```typescript
function applyEffect(ctx: CanvasRenderingContext2D, size: number) {
  if (activeEffects.pixelation) {
    applyPixelation(ctx, size, effectParams.pixelationSize);
  }
  
  if (activeEffects.newEffect) {
    applyNewEffect(ctx, size, effectParams.newEffectParam);
  }
}
```

5. Добавьте UI-элементы управления в соответствующую вкладку

### Добавление новых типов градиентов

1. Добавьте тип в union:
```typescript
type GradientType = "radial" | "linear" | "diamond" | "newType";
```

2. Добавьте логику отрисовки в `drawAvatar()`:
```typescript
else if (gradient.type === "newType") {
  // Ваша логика отрисовки нового градиента
}
```

3. Обновите `generateRandomGradient()`:
```typescript
const types: GradientType[] = ["radial", "linear", "diamond", "newType"];
```

### Изменение размера аватарки

Для изменения размера экспорта измените:

1. **Текст в UI** (строка ~1143):
```typescript
<p className="text-gray-600">1080×1080 px</p>
// Замените на нужный размер
```

2. **Атрибуты canvas** (строка ~1154):
```typescript
<canvas
  ref={canvasRef}
  width={1080}   // Новая ширина
  height={1080}  // Новая высота
  className="w-full h-full object-cover"
/>
```

3. **Константу size** в `drawAvatar()` (строка ~430):
```typescript
const size = 1080; // Новый размер
```

### Добавление анимаций

В проекте используются две анимации:

1. **Тряска** (`isShaking`): применяется к превью при перемешивании эмодзи
```typescript
className={`relative w-64 h-64 mb-6 ${isShaking ? 'animate-shake' : ''}`}
```

2. **Генерация** (`isGenerating`): белый градиент при рандомизации
```typescript
{isGenerating && (
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-70 animate-generating" />
)}
```

Для добавления своих анимаций создайте CSS-классы в `/src/styles/theme.css`:

```css
@keyframes your-animation {
  0% { /* начальное состояние */ }
  100% { /* конечное состояние */ }
}

.animate-your-animation {
  animation: your-animation 0.5s ease-in-out;
}
```

### Работа с логотипом

Логотип хранится в файле `/src/imports/svg-pdfdvkp3zc.ts` как SVG-пути.

Для замены логотипа:
1. Получите SVG-файл
2. Извлеките пути из атрибута `d` элементов `<path>`
3. Замените значения в объекте `svgPaths`
4. Убедитесь, что viewBox оригинального SVG соответствует размеру 120×120

---

## Важные технические детали

### Canvas Context Options
```typescript
const ctx = canvas.getContext("2d", { willReadFrequently: true });
```
Опция `willReadFrequently: true` оптимизирует работу с пикселями (для пикселизации и diamond-градиента).

### Эффект useEffect
Аватарка перерисовывается при изменении любого из параметров:

```typescript
useEffect(() => {
  if (!isMounted) return;
  drawAvatar();
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
  emojiSeed
]);
```

**Важно:** Объекты сериализуются через `JSON.stringify()` для корректного сравнения.

### Защищенные файлы

Следующие файлы **НЕ ДОЛЖНЫ** изменяться:
- `/src/app/components/figma/ImageWithFallback.tsx`
- `/pnpm-lock.yaml`

---

## Структура UI

```
┌─────────────────────────────────────────────────────┐
│  Генератор аватарок                                 │
│  1080×1080 px                                       │
│                                                     │
│  ┌─────────────┐  ┌────────────────────────────┐   │
│  │             │  │ Вкладки:                   │   │
│  │   Превью    │  │ [Цвет] [Градиент] [Эмодзи] │   │
│  │   (круг)    │  │                            │   │
│  │      ✨      │  │ ... настройки вкладки ...  │   │
│  │             │  │                            │   │
│  └─────────────┘  └────────────────────────────┘   │
│                                                     │
│  [📥 Скачать PNG]                                   │
└─────────────────────────────────────────────────────┘
```

### CSS Framework
Используется **Tailwind CSS v4** без файла конфигурации.

Основные цвета интерфейса:
- Акцент (розовый): `#ff8fda`
- Акцент 2 (фиолетовый): `#c16ffb`
- Темный текст: `#3f0030`
- Кнопка рандомизации (фон): `#300247`
- Кнопка рандомизации (иконка): `#C16FFB`

---

## Типы TypeScript

### Основные интерфейсы

```typescript
type BackgroundType = "color" | "gradient";
type SettingsTab = "color" | "gradient" | "emoji";
type GradientType = "radial" | "linear" | "diamond";

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
  angle: number;
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
  layout: "random" | "grid";
}
```

---

## Быстрый старт для разработки

1. **Найти компонент**: `/src/app/components/AvatarGenerator.tsx`
2. **Найти нужную секцию**:
   - Цвета: строки ~26-47
   - Градиенты: функция `generateRandomGradient()` (строка ~203)
   - Эффекты: функция `applyEffect()` (строка ~577)
   - Эмодзи: функция `drawEmojiPattern()` (строка ~505)
   - Логотип: функция `drawLogo()` (строка ~471)
   - UI вкладок: строки ~1167-1405
3. **Внести изменения**
4. **Проверить результат** в браузере

---

## Глоссарий

- **Аватарка** — квадратное изображение 1080×1080 пикселей с логотипом
- **Объемность** — 3D-эффект с тенями и бликами (только для однотонных фонов)
- **Паттерн** — повторяющийся узор из эмодзи поверх фона
- **Seed** — начальное значение для детерминированной генерации случайных чисел
- **Canvas** — HTML-элемент для рендеринга графики
- **SVG-пути** — векторные данные логотипа в формате SVG path
- **Luminance** — яркость цвета (0-1), используется для выбора контрастного цвета логотипа

---

## Контакты и поддержка

Этот проект представляет собой автономный React-компонент без внешних зависимостей (кроме React, Tailwind и Lucide Icons).

При возникновении вопросов обратитесь к этой документации или изучите код в `/src/app/components/AvatarGenerator.tsx`.

---

**Версия документации:** 1.0  
**Дата:** 2026-02-23  
**Размер экспорта:** 1080×1080 пикселей
