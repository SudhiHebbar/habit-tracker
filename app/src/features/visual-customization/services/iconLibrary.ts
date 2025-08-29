/**
 * Icon Library Service
 * Manages the comprehensive icon collection with categorization, search, and metadata
 */

// Legacy icon ID mapping for backward compatibility
const LEGACY_ICON_MAPPING: Record<string, string> = {
  'water': 'water-drop',
  'exercise': 'dumbbell',
  'meditation': 'yoga',
  'moon': 'sleep',
  'heart-pulse': 'heart',  // In case heart-pulse was used
  // Add any other legacy mappings as needed
};

export interface IconOption {
  id: string;
  name: string;
  category: IconCategory;
  svg: string;
  tags: string[];
  keywords?: string[];
  description?: string;
  variants?: {
    filled?: string;
    outline?: string;
    mini?: string;
  };
  isPopular?: boolean;
  isNew?: boolean;
  accessibility?: {
    ariaLabel: string;
    description: string;
  };
}

export type IconCategory = 
  | 'health'
  | 'fitness'
  | 'learning'
  | 'work'
  | 'lifestyle'
  | 'nature'
  | 'food'
  | 'social'
  | 'creative'
  | 'finance'
  | 'travel'
  | 'system'
  | 'communication'
  | 'entertainment';

export interface IconCategoryInfo {
  id: IconCategory;
  name: string;
  description: string;
  color: string;
  count: number;
}

/**
 * Comprehensive Icon Library
 * Based on popular icon sets and habit tracking needs
 */
export const ICON_LIBRARY: IconOption[] = [
  // Health & Fitness Icons
  {
    id: 'heart',
    name: 'Heart',
    category: 'health',
    tags: ['health', 'love', 'heart-rate', 'cardio'],
    keywords: ['heart', 'love', 'health', 'cardio', 'pulse'],
    description: 'Heart icon for health and wellness habits',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
    isPopular: true,
    accessibility: {
      ariaLabel: 'Heart icon',
      description: 'Represents health, wellness, and cardiovascular activities',
    },
  },
  {
    id: 'water-drop',
    name: 'Water Drop',
    category: 'health',
    tags: ['water', 'hydration', 'drink', 'health'],
    keywords: ['water', 'drink', 'hydration', 'drop', 'liquid'],
    description: 'Water drop for hydration tracking',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z"/></svg>',
    isPopular: true,
    accessibility: {
      ariaLabel: 'Water drop icon',
      description: 'Represents hydration, water intake, and liquid consumption',
    },
  },
  {
    id: 'pill',
    name: 'Pill',
    category: 'health',
    tags: ['medicine', 'medication', 'health', 'pharmacy'],
    keywords: ['pill', 'medicine', 'medication', 'health', 'drug', 'pharmacy'],
    description: 'Pill icon for medication reminders',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.22 11.29l6.93-6.93a1.5 1.5 0 0 1 2.12 0l5.657 5.657a1.5 1.5 0 0 1 0 2.121l-6.93 6.93a1.5 1.5 0 0 1-2.12 0L4.22 13.411a1.5 1.5 0 0 1 0-2.121z"/><path d="M14.121 4.464l5.657 5.657-2.828 2.828-5.657-5.657 2.828-2.828z"/></svg>',
    accessibility: {
      ariaLabel: 'Pill icon',
      description: 'Represents medication, supplements, and health treatments',
    },
  },
  {
    id: 'sleep',
    name: 'Sleep',
    category: 'health',
    tags: ['sleep', 'rest', 'bedtime', 'moon'],
    keywords: ['sleep', 'rest', 'bed', 'night', 'moon', 'bedtime'],
    description: 'Sleep icon for rest and sleep tracking',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.37 5.51A7.5 7.5 0 0 0 9.37 18.49 5.5 5.5 0 0 1 9.37 5.51z"/></svg>',
    accessibility: {
      ariaLabel: 'Sleep icon',
      description: 'Represents sleep, rest, and bedtime routines',
    },
  },

  // Fitness Icons
  {
    id: 'dumbbell',
    name: 'Dumbbell',
    category: 'fitness',
    tags: ['gym', 'workout', 'strength', 'exercise'],
    keywords: ['dumbbell', 'weight', 'gym', 'exercise', 'strength', 'workout'],
    description: 'Dumbbell for strength training',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71 3.43 9.14 7 5.57 15.57 14.14 12 17.71 13.43 19.14 14.86 17.71 16.29 19.14 18.43 17 19.86 18.43 21.29 17l-1.43-1.43L22 13.43z"/></svg>',
    isPopular: true,
    accessibility: {
      ariaLabel: 'Dumbbell icon',
      description: 'Represents weight lifting, strength training, and gym workouts',
    },
  },
  {
    id: 'running',
    name: 'Running',
    category: 'fitness',
    tags: ['run', 'cardio', 'exercise', 'sport'],
    keywords: ['running', 'run', 'cardio', 'exercise', 'sport', 'jogging'],
    description: 'Running figure for cardio activities',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/></svg>',
    isPopular: true,
    accessibility: {
      ariaLabel: 'Running icon',
      description: 'Represents running, jogging, and cardiovascular exercise',
    },
  },
  {
    id: 'yoga',
    name: 'Yoga',
    category: 'fitness',
    tags: ['yoga', 'meditation', 'stretch', 'flexibility'],
    keywords: ['yoga', 'meditation', 'stretch', 'flexibility', 'pose', 'zen'],
    description: 'Yoga pose for flexibility and mindfulness',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 12c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-2-9c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/></svg>',
    accessibility: {
      ariaLabel: 'Yoga icon',
      description: 'Represents yoga, meditation, and mindfulness practices',
    },
  },

  // Learning Icons
  {
    id: 'book',
    name: 'Book',
    category: 'learning',
    tags: ['reading', 'education', 'study', 'knowledge'],
    keywords: ['book', 'reading', 'study', 'education', 'learn', 'knowledge'],
    description: 'Book for reading and learning habits',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/></svg>',
    isPopular: true,
    accessibility: {
      ariaLabel: 'Book icon',
      description: 'Represents reading, studying, and educational activities',
    },
  },
  {
    id: 'brain',
    name: 'Brain',
    category: 'learning',
    tags: ['brain', 'mind', 'intelligence', 'learning'],
    keywords: ['brain', 'mind', 'think', 'intelligence', 'memory', 'mental'],
    description: 'Brain for mental exercises and learning',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-5 2h-4v2h4V5m-4 6v4h4v-4h-4m-6 4h4v-4H4v4m0-6V5h4v4H4Z"/></svg>',
    accessibility: {
      ariaLabel: 'Brain icon',
      description: 'Represents mental exercise, learning, and cognitive activities',
    },
  },
  {
    id: 'language',
    name: 'Language',
    category: 'learning',
    tags: ['language', 'translate', 'global', 'communication'],
    keywords: ['language', 'translate', 'global', 'world', 'communication', 'speech'],
    description: 'Globe for language learning',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>',
    accessibility: {
      ariaLabel: 'Language icon',
      description: 'Represents language learning and international communication',
    },
  },

  // Work & Productivity Icons
  {
    id: 'laptop',
    name: 'Laptop',
    category: 'work',
    tags: ['computer', 'work', 'productivity', 'technology'],
    keywords: ['laptop', 'computer', 'work', 'productivity', 'technology', 'coding'],
    description: 'Laptop for work and productivity',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2H0c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2h-4zM4 5h16v11H4V5z"/></svg>',
    isPopular: true,
    accessibility: {
      ariaLabel: 'Laptop icon',
      description: 'Represents work, productivity, and computer-based activities',
    },
  },
  {
    id: 'checklist',
    name: 'Checklist',
    category: 'work',
    tags: ['task', 'todo', 'productivity', 'organize'],
    keywords: ['checklist', 'task', 'todo', 'list', 'organize', 'productivity'],
    description: 'Checklist for task management',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"/></svg>',
    isPopular: true,
    accessibility: {
      ariaLabel: 'Checklist icon',
      description: 'Represents task management, to-do lists, and organization',
    },
  },
  {
    id: 'clock',
    name: 'Clock',
    category: 'work',
    tags: ['time', 'schedule', 'productivity', 'clock'],
    keywords: ['clock', 'time', 'schedule', 'productivity', 'timing', 'deadline'],
    description: 'Clock for time management',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>',
    accessibility: {
      ariaLabel: 'Clock icon',
      description: 'Represents time management, scheduling, and deadlines',
    },
  },

  // Lifestyle Icons
  {
    id: 'home',
    name: 'Home',
    category: 'lifestyle',
    tags: ['home', 'house', 'family', 'domestic'],
    keywords: ['home', 'house', 'family', 'domestic', 'living'],
    description: 'Home for domestic activities',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
    accessibility: {
      ariaLabel: 'Home icon',
      description: 'Represents home, family, and domestic activities',
    },
  },
  {
    id: 'music',
    name: 'Music',
    category: 'lifestyle',
    tags: ['music', 'entertainment', 'art', 'creative'],
    keywords: ['music', 'song', 'entertainment', 'art', 'creative', 'audio'],
    description: 'Music note for entertainment',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>',
    accessibility: {
      ariaLabel: 'Music icon',
      description: 'Represents music, entertainment, and creative activities',
    },
  },
  {
    id: 'coffee',
    name: 'Coffee',
    category: 'lifestyle',
    tags: ['coffee', 'drink', 'morning', 'caffeine'],
    keywords: ['coffee', 'drink', 'morning', 'caffeine', 'beverage', 'cup'],
    description: 'Coffee cup for morning routines',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3z"/></svg>',
    accessibility: {
      ariaLabel: 'Coffee icon',
      description: 'Represents coffee drinking, morning routines, and beverages',
    },
  },

  // Nature & Environment Icons
  {
    id: 'tree',
    name: 'Tree',
    category: 'nature',
    tags: ['nature', 'environment', 'green', 'outdoor'],
    keywords: ['tree', 'nature', 'environment', 'green', 'plant', 'outdoor'],
    description: 'Tree for environmental activities',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66c.85-2.15 1.98-4.92 3.46-7.66C10.2 17.23 12 19 14.19 19c4.15 0 7.81-2.09 7.81-6.23C22 8.79 20.21 8 17 8z"/><path d="M13 2L8.5 7h9L13 2z"/></svg>',
    accessibility: {
      ariaLabel: 'Tree icon',
      description: 'Represents nature, environment, and outdoor activities',
    },
  },
  {
    id: 'sun',
    name: 'Sun',
    category: 'nature',
    tags: ['sun', 'weather', 'outdoor', 'morning'],
    keywords: ['sun', 'sunny', 'weather', 'outdoor', 'morning', 'light'],
    description: 'Sun for outdoor activities',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/></svg>',
    accessibility: {
      ariaLabel: 'Sun icon',
      description: 'Represents sunshine, outdoor activities, and morning routines',
    },
  },

  // Food Icons
  {
    id: 'apple',
    name: 'Apple',
    category: 'food',
    tags: ['fruit', 'healthy', 'nutrition', 'diet'],
    keywords: ['apple', 'fruit', 'healthy', 'nutrition', 'diet', 'food'],
    description: 'Apple for healthy eating',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a3 3 0 0 0 3 3c1.1 0 2-.9 2-2s-.9-2-2-2a3 3 0 0 0-3 3zm4.5 2c-1.74 0-3.41.81-4.5 2.09C10.91 4.81 9.24 4 7.5 4 4.42 4 2 6.42 2 9.5c0 3.78 3.4 6.86 8.55 11.54L12 22.35l1.45-1.32C18.6 16.36 22 13.28 22 9.5 22 6.42 19.58 4 16.5 4z"/></svg>',
    accessibility: {
      ariaLabel: 'Apple icon',
      description: 'Represents healthy eating, nutrition, and diet tracking',
    },
  },
  {
    id: 'utensils',
    name: 'Utensils',
    category: 'food',
    tags: ['food', 'eating', 'meal', 'dining'],
    keywords: ['utensils', 'fork', 'knife', 'food', 'eating', 'meal', 'dining'],
    description: 'Utensils for meal tracking',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.1 13.34l2.83-2.83L3.91 3.5a4.008 4.008 0 0 0 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/></svg>',
    accessibility: {
      ariaLabel: 'Utensils icon',
      description: 'Represents eating, meals, and food-related activities',
    },
  },

  // System Icons
  {
    id: 'star',
    name: 'Star',
    category: 'system',
    tags: ['favorite', 'star', 'important', 'highlight'],
    keywords: ['star', 'favorite', 'important', 'rating', 'highlight'],
    description: 'Star for important habits',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
    isPopular: true,
    accessibility: {
      ariaLabel: 'Star icon',
      description: 'Represents favorites, important items, and ratings',
    },
  },
  {
    id: 'target',
    name: 'Target',
    category: 'system',
    tags: ['goal', 'target', 'objective', 'aim'],
    keywords: ['target', 'goal', 'objective', 'aim', 'bullseye'],
    description: 'Target for goals and objectives',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
    accessibility: {
      ariaLabel: 'Target icon',
      description: 'Represents goals, objectives, and targets to achieve',
    },
  },
  {
    id: 'gift',
    name: 'Gift',
    category: 'system',
    tags: ['reward', 'gift', 'achievement', 'celebration'],
    keywords: ['gift', 'reward', 'present', 'achievement', 'celebration'],
    description: 'Gift for rewards and celebrations',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/></svg>',
    accessibility: {
      ariaLabel: 'Gift icon',
      description: 'Represents rewards, achievements, and celebrations',
    },
  },
];

/**
 * Category information with metadata
 */
export const ICON_CATEGORIES: IconCategoryInfo[] = [
  {
    id: 'health',
    name: 'Health & Wellness',
    description: 'Icons for health, medical, and wellness activities',
    color: '#10B981',
    count: ICON_LIBRARY.filter(icon => icon.category === 'health').length,
  },
  {
    id: 'fitness',
    name: 'Fitness & Exercise',
    description: 'Icons for physical activities, workouts, and sports',
    color: '#F59E0B',
    count: ICON_LIBRARY.filter(icon => icon.category === 'fitness').length,
  },
  {
    id: 'learning',
    name: 'Learning & Education',
    description: 'Icons for educational activities, studying, and skill development',
    color: '#3B82F6',
    count: ICON_LIBRARY.filter(icon => icon.category === 'learning').length,
  },
  {
    id: 'work',
    name: 'Work & Productivity',
    description: 'Icons for professional activities, tasks, and productivity',
    color: '#6366F1',
    count: ICON_LIBRARY.filter(icon => icon.category === 'work').length,
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle & Daily',
    description: 'Icons for daily activities, hobbies, and lifestyle habits',
    color: '#8B5CF6',
    count: ICON_LIBRARY.filter(icon => icon.category === 'lifestyle').length,
  },
  {
    id: 'nature',
    name: 'Nature & Environment',
    description: 'Icons for outdoor activities, nature, and environmental habits',
    color: '#059669',
    count: ICON_LIBRARY.filter(icon => icon.category === 'nature').length,
  },
  {
    id: 'food',
    name: 'Food & Nutrition',
    description: 'Icons for dietary habits, cooking, and nutrition tracking',
    color: '#DC2626',
    count: ICON_LIBRARY.filter(icon => icon.category === 'food').length,
  },
  {
    id: 'social',
    name: 'Social & Communication',
    description: 'Icons for social activities and communication habits',
    color: '#EC4899',
    count: ICON_LIBRARY.filter(icon => icon.category === 'social').length,
  },
  {
    id: 'creative',
    name: 'Creative & Artistic',
    description: 'Icons for creative pursuits, art, and design activities',
    color: '#F97316',
    count: ICON_LIBRARY.filter(icon => icon.category === 'creative').length,
  },
  {
    id: 'finance',
    name: 'Finance & Money',
    description: 'Icons for financial habits, budgeting, and money management',
    color: '#65A30D',
    count: ICON_LIBRARY.filter(icon => icon.category === 'finance').length,
  },
  {
    id: 'travel',
    name: 'Travel & Adventure',
    description: 'Icons for travel, adventure, and exploration activities',
    color: '#0EA5E9',
    count: ICON_LIBRARY.filter(icon => icon.category === 'travel').length,
  },
  {
    id: 'system',
    name: 'System & General',
    description: 'General purpose icons for various habit types',
    color: '#64748B',
    count: ICON_LIBRARY.filter(icon => icon.category === 'system').length,
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'Icons for communication and messaging activities',
    color: '#7C3AED',
    count: ICON_LIBRARY.filter(icon => icon.category === 'communication').length,
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    description: 'Icons for entertainment, media, and leisure activities',
    color: '#BE185D',
    count: ICON_LIBRARY.filter(icon => icon.category === 'entertainment').length,
  },
];

/**
 * Icon Library Service Class
 */
export class IconLibrary {
  /**
   * Get all available icons
   */
  static getAllIcons(): IconOption[] {
    return ICON_LIBRARY;
  }

  /**
   * Get icons by category
   */
  static getIconsByCategory(category: IconCategory): IconOption[] {
    return ICON_LIBRARY.filter(icon => icon.category === category);
  }

  /**
   * Get icon by ID
   */
  static getIconById(id: string): IconOption | undefined {
    return ICON_LIBRARY.find(icon => icon.id === id);
  }

  /**
   * Get icon SVG by ID (for display components)
   * Includes backward compatibility for legacy icon IDs
   */
  static getIconSvgById(id: string): string | null {
    // First, check if this is a legacy icon ID and map it
    const mappedId = LEGACY_ICON_MAPPING[id] || id;
    
    // Then look for the icon with the mapped ID
    const icon = ICON_LIBRARY.find(icon => icon.id === mappedId);
    return icon ? icon.svg : null;
  }

  /**
   * Get all categories with metadata
   */
  static getCategories(): IconCategoryInfo[] {
    return ICON_CATEGORIES;
  }

  /**
   * Get category info by ID
   */
  static getCategoryById(id: IconCategory): IconCategoryInfo | undefined {
    return ICON_CATEGORIES.find(category => category.id === id);
  }

  /**
   * Search icons by query
   */
  static searchIcons(query: string): IconOption[] {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
      return ICON_LIBRARY;
    }

    return ICON_LIBRARY.filter(icon => 
      icon.name.toLowerCase().includes(searchTerm) ||
      icon.category.toLowerCase().includes(searchTerm) ||
      icon.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      (icon.keywords && icon.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchTerm)
      )) ||
      (icon.description && icon.description.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Get popular icons
   */
  static getPopularIcons(): IconOption[] {
    return ICON_LIBRARY.filter(icon => icon.isPopular);
  }

  /**
   * Get new icons
   */
  static getNewIcons(): IconOption[] {
    return ICON_LIBRARY.filter(icon => icon.isNew);
  }

  /**
   * Get icons by tags
   */
  static getIconsByTags(tags: string[]): IconOption[] {
    return ICON_LIBRARY.filter(icon => 
      tags.some(tag => 
        icon.tags.some(iconTag => 
          iconTag.toLowerCase().includes(tag.toLowerCase())
        )
      )
    );
  }

  /**
   * Get random icons
   */
  static getRandomIcons(count: number = 10): IconOption[] {
    const shuffled = [...ICON_LIBRARY].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Filter icons by multiple criteria
   */
  static filterIcons(criteria: {
    category?: IconCategory;
    tags?: string[];
    isPopular?: boolean;
    isNew?: boolean;
    query?: string;
  }): IconOption[] {
    let filtered = ICON_LIBRARY;

    if (criteria.category) {
      filtered = filtered.filter(icon => icon.category === criteria.category);
    }

    if (criteria.tags && criteria.tags.length > 0) {
      filtered = filtered.filter(icon => 
        criteria.tags!.some(tag => 
          icon.tags.some(iconTag => 
            iconTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    if (criteria.isPopular !== undefined) {
      filtered = filtered.filter(icon => icon.isPopular === criteria.isPopular);
    }

    if (criteria.isNew !== undefined) {
      filtered = filtered.filter(icon => icon.isNew === criteria.isNew);
    }

    if (criteria.query) {
      filtered = this.searchIcons(criteria.query).filter(icon => 
        filtered.includes(icon)
      );
    }

    return filtered;
  }

  /**
   * Get icon suggestions based on habit category
   */
  static getIconSuggestionsForHabit(habitCategory: string): IconOption[] {
    const categoryMap: { [key: string]: IconCategory[] } = {
      'health': ['health', 'fitness'],
      'fitness': ['fitness', 'health'],
      'learning': ['learning', 'work'],
      'work': ['work', 'system'],
      'lifestyle': ['lifestyle', 'system'],
      'food': ['food', 'health'],
      'creative': ['creative', 'entertainment'],
      'social': ['social', 'communication'],
      'outdoor': ['nature', 'fitness'],
    };

    const suggestedCategories = categoryMap[habitCategory.toLowerCase()] || ['system'];
    
    return ICON_LIBRARY.filter(icon => 
      suggestedCategories.includes(icon.category)
    );
  }

  /**
   * Get icon statistics
   */
  static getIconStats(): {
    total: number;
    byCategory: { [key in IconCategory]: number };
    popular: number;
    new: number;
  } {
    const stats = {
      total: ICON_LIBRARY.length,
      byCategory: {} as { [key in IconCategory]: number },
      popular: ICON_LIBRARY.filter(icon => icon.isPopular).length,
      new: ICON_LIBRARY.filter(icon => icon.isNew).length,
    };

    ICON_CATEGORIES.forEach(category => {
      stats.byCategory[category.id] = category.count;
    });

    return stats;
  }
}

export default IconLibrary;