export type Memory = {
  id: number;
  title: string;
  image: string;
  text: string;
  accent: string;
  fruitColor: string;
};

export const memories: Memory[] = [
  { id: 1, title: 'The Beginning', image: '/images/photo1.jpg', text: 'The first little spark that made everything feel possible. I still smile when I think about it.', accent: '#f5b6bb', fruitColor: '#e8917a' },
  { id: 2, title: 'Our Little Moments', image: '/images/photo2.jpg', text: 'The quiet laughs, the silly stories, and all the ordinary days that became my favorite ones.', accent: '#e8c58c', fruitColor: '#d9a441' },
  { id: 3, title: 'My Favorite Person', image: '/images/photo3.jpg', text: 'You make every room warmer, every day softer, and my world infinitely more beautiful.', accent: '#f3d49b', fruitColor: '#c75d6e' },
  { id: 4, title: 'Us', image: '/images/photo4.jpg', text: 'Two hearts, one little universe. Wherever we go, it feels a little bit like home.', accent: '#eaaab8', fruitColor: '#7d4b8a' },
  { id: 5, title: 'Forever & Always', image: '/images/photo5.jpg', text: 'If I could choose again in every lifetime, I would find you and choose you all over again.', accent: '#f6d791', fruitColor: '#b5527a' },
];

export const finalMessage = [
  'Happy Birthday, my love',
  'Thank you for being one of the most beautiful parts of my life.',
  'May your smile always be as beautiful as the day I fell in love with you.',
  'I love you, always.',
  '— Yours, forever',
];
