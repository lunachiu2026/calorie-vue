import img1 from '../views/teacher/11.jpg'
import img2 from '../views/teacher/22.jpg'
import img3 from '../views/teacher/33.jpg'
import img4 from '../views/teacher/44.jpg'
export const nutritionists = [
  {
    id: 'nutritionist-1',
    name: '李志宏',
    title: '營養師',
    price: '每堂 NT$ 1,500',
    specialty: '專長：減重體態雕塑',
    rating: '⭐ 4.9',
    reviews: '(211 則真實學員好評)',
    image: img1
  },
  {
    id: 'nutritionist-2',
    name: '陳安妤',
    title: '臨床營養師',
    price: '每堂 NT$ 1,600',
    specialty: '專長：三高飲食調理',
    rating: '⭐ 4.8',
    reviews: '(206 則真實學員好評)',
    image: img2
  },
  {
    id: 'nutritionist-3',
    name: '陳家明',
    title: '營養師',
    price: '每堂 NT$ 1,500',
    specialty: '專長：運動營養學',
    rating: '⭐ 4.9',
    reviews: '(208 則真實學員好評)',
    image: img3
  },
  {
    id: 'nutritionist-4',
    name: '陳姿妤',
    title: '臨床營養師',
    price: '每堂 NT$ 1,600',
    specialty: '專長：孕期母嬰營養',
    rating: '⭐ 4.8',
    reviews: '(228 則真實學員好評)',
    image: img4
  }
]
export const findNutritionist = id => nutritionists.find(person => person.id === id || person.name === id)
